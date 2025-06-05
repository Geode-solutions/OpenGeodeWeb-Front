import { describe, test, expect, expectTypeOf, beforeEach, vi } from "vitest"
import { registerEndpoint } from "@nuxt/test-utils/runtime"
import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"
import Status from "@ogw_f/utils/status.js"

// Mock navigator.locks API
const mockLockRequest = vi.fn().mockImplementation(async (name, callback) => {
  return callback({ name })
})

vi.stubGlobal("navigator", {
  ...navigator,
  locks: {
    request: mockLockRequest,
  },
})

describe("Infra Store", () => {
  const pinia = createTestingPinia({
    stubActions: false,
  })
  setActivePinia(pinia)
  const infra_store = use_infra_store()
  const geode_store = use_geode_store()
  const viewer_store = use_viewer_store()
  const feedback_store = use_feedback_store()

  beforeEach(() => {
    console.log("BEFORE EACH")
    infra_store.$reset()
    geode_store.$reset()
    feedback_store.$reset()
    viewer_store.$reset()
  })
  describe("state", () => {
    test("initial state", () => {
      expectTypeOf(infra_store.ID).toBeString()
      expectTypeOf(infra_store.is_captcha_validated).toBeBoolean()
      expectTypeOf(infra_store.status).toBeString()
    })
  })
  describe("getters", () => {
    describe("is_cloud", () => {
      test("test type", () => {
        expectTypeOf(infra_store.is_cloud).toBeBoolean()
      })
    })

    describe("domain_name", () => {
      test("test type", () => {
        expectTypeOf(infra_store.is_cloud).toBeString()
      })
      test("test is_cloud false", () => {
        infra_store.is_cloud = false
        expect(infra_store.domain_name).toBe("localhost")
      })
      test("test is_cloud false", () => {
        infra_store.is_cloud = true
        expect(infra_store.domain_name).toBe("api.geode-solutions.com")
      })
    })

    describe("lambda_url", () => {
      test("test is cloud true", () => {
        useRuntimeConfig().public.SITE_BRANCH = "/test"
        useRuntimeConfig().public.PROJECT = "/project"
        infra_store.is_cloud = true
        expect(infra_store.lambda_url).toBe(
          "https://api.geode-solutions.com:443/test/project/createbackend",
        )
      })
    })
    describe("status", () => {
      test("test geode false & viewer false", () => {
        geode_store.$patch({ status: Status.NOT_CONNECTED })
        viewer_store.$patch({ status: Status.NOT_CONNECTED })
        console.log("Status", Status)
        expect(infra_store.microservices_connected).toBe(false)
      })
      test("test geode true & viewer false", () => {
        geode_store.$patch({ status: Status.CONNECTED })
        viewer_store.$patch({ status: Status.NOT_CONNECTED })
        expect(infra_store.microservices_connected).toBe(false)
      })
      test("test geode false & viewer true", () => {
        geode_store.$patch({ status: Status.NOT_CONNECTED })
        viewer_store.$patch({ status: Status.CONNECTED })
        expect(infra_store.microservices_connected).toBe(false)
      })
      test("test geode true & viewer true", () => {
        geode_store.$patch({ status: Status.CONNECTED })
        viewer_store.$patch({ status: Status.CONNECTED })
        expect(infra_store.microservices_connected).toBe(true)
      })
    })

    describe("is_busy", () => {
      test("test geode false & viewer false", () => {
        geode_store.$patch({ request_counter: 0 })
        viewer_store.$patch({ request_counter: 0 })
        expect(infra_store.microservices_busy).toBe(false)
      })
      test("test geode true & viewer false", () => {
        geode_store.$patch({ request_counter: 1 })
        viewer_store.$patch({ request_counter: 0 })
        expect(infra_store.microservices_busy).toBe(true)
      })
      test("test geode false & viewer true", () => {
        geode_store.$patch({ request_counter: 0 })
        viewer_store.$patch({ request_counter: 1 })
        expect(infra_store.microservices_busy).toBe(true)
      })
      test("test geode true & viewer true", () => {
        geode_store.$patch({ request_counter: 1 })
        viewer_store.$patch({ request_counter: 1 })
        expect(infra_store.microservices_busy).toBe(true)
      })
    })
  })

  describe("actions", () => {
    describe("create_backend", () => {
      test("test without end-point", async () => {
        await infra_store.create_backend()
        console.log("geode_store.status", geode_store.status)
        expect(infra_store.status).toBe(Status.NOT_CREATED)
        expect(geode_store.status).toBe(Status.NOT_CONNECTED)
        expect(viewer_store.status).toBe(Status.NOT_CONNECTED)
      })
      test("test with end-point", async () => {
        registerEndpoint(infra_store.lambda_url, {
          method: "POST",
          handler: () => ({ ID: "123456" }),
        })
        await infra_store.create_backend()
        expect(infra_store.status).toBe(Status.CREATED)
        expect(geode_store.status).toBe(Status.NOT_CONNECTED)
        expect(viewer_store.status).toBe(Status.NOT_CONNECTED)
        expect(feedback_store.server_error).toBe(true)
      })
    })
  })
})
