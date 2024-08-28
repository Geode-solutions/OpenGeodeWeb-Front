import { describe, test, expect, beforeEach } from "vitest"
import { registerEndpoint } from "@nuxt/test-utils/runtime"
import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"

describe("Cloud Store", () => {
  const pinia = createTestingPinia({
    stubActions: false,
  })
  setActivePinia(pinia)
  const infra_store = use_infra_store()
  const geode_store = use_geode_store()
  const viewer_store = use_viewer_store()
  const feedback_store = use_feedback_store()

  beforeEach(() => {
    infra_store.$reset()
    geode_store.$reset()
    feedback_store.$reset()
    viewer_store.$reset()
  })
  describe("state", () => {
    test("initial state", () => {
      expectTypeOf(infra_store.ID).toBeString()
      expectTypeOf(infra_store.is_captcha_validated).toBeBoolean()
      expectTypeOf(infra_store.is_connexion_launched).toBeBoolean()
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
    describe("is_running", () => {
      test("test geode false & viewer false", () => {
        geode_store.$patch({ is_running: false })
        viewer_store.$patch({ is_running: false })
        expect(infra_store.is_running).toBe(false)
      })
      test("test geode true & viewer false", () => {
        geode_store.$patch({ is_running: true })
        viewer_store.$patch({ is_running: false })
        expect(infra_store.is_running).toBe(false)
      })
      test("test geode false & viewer true", () => {
        geode_store.$patch({ is_running: false })
        viewer_store.$patch({ is_running: true })
        expect(infra_store.is_running).toBe(false)
      })
      test("test geode true & viewer true", () => {
        geode_store.$patch({ is_running: true })
        viewer_store.$patch({ is_running: true })
        expect(infra_store.is_running).toBe(true)
      })
    })

    describe("is_busy", () => {
      test("test geode false & viewer false", () => {
        geode_store.$patch({ request_counter: 0 })
        viewer_store.$patch({ request_counter: 0 })
        expect(infra_store.is_busy).toBe(false)
      })
      test("test geode true & viewer false", () => {
        geode_store.$patch({ request_counter: 1 })
        viewer_store.$patch({ request_counter: 0 })
        expect(infra_store.is_busy).toBe(true)
      })
      test("test geode false & viewer true", () => {
        geode_store.$patch({ request_counter: 0 })
        viewer_store.$patch({ request_counter: 1 })
        expect(infra_store.is_busy).toBe(true)
      })
      test("test geode true & viewer true", () => {
        geode_store.$patch({ request_counter: 1 })
        viewer_store.$patch({ request_counter: 1 })
        expect(infra_store.is_busy).toBe(true)
      })
    })
  })

  // describe("actions", () => {
  //   describe("create_backend", async () => {
  //     test("test without end-point", async () => {
  //       expect(geode_store.is_running).toBe(false)
  //       await infra_store.create_backend()
  //       expect(geode_store.is_running).toBe(false)
  //     })
  //     test("test with end-point", async () => {
  //       expect(geode_store.is_running).toBe(false)
  //       registerEndpoint("/createbackend", {
  //         method: "POST",
  //         handler: () => ({ ID: "123456" }),
  //       })
  //       await infra_store.create_backend()
  //       await flushPromises()
  //     })
  //   })
  // })
})
