// Global imports

// Third party imports
import { registerEndpoint } from "@nuxt/test-utils/runtime"
import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"
import { beforeEach, describe, expect, expectTypeOf, test, vi } from "vitest"
// Local imports
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

beforeEach(async () => {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })
  setActivePinia(pinia)
})

describe("Infra Store", () => {
  describe("state", () => {
    test("initial state", () => {
      const infra_store = useInfraStore()
      expectTypeOf(infra_store.ID).toBeString()
      expectTypeOf(infra_store.is_captcha_validated).toBeBoolean()
      expectTypeOf(infra_store.status).toBeString()
    })
  })
  describe("getters", () => {
    describe("app_mode", () => {
      test("test type", () => {
        const infra_store = useInfraStore()
        expectTypeOf(infra_store.app_mode).toBeString()
      })
    })

    describe("domain_name", () => {
      test("test app_mode BROWSER", () => {
        const infra_store = useInfraStore()
        infra_store.app_mode = appMode.appMode.BROWSER
        expect(infra_store.domain_name).toBe("localhost")
      })
      test("test app_mode DESKTOP", () => {
        const infra_store = useInfraStore()
        infra_store.app_mode = appMode.appMode.DESKTOP
        expect(infra_store.domain_name).toBe("localhost")
      })
      test("test app_mode CLOUD", () => {
        const infra_store = useInfraStore()
        infra_store.app_mode = appMode.appMode.CLOUD
        expect(infra_store.domain_name).toBe("api.geode-solutions.com")
      })
    })

    describe("lambda_url", () => {
      test("test is cloud true", () => {
        const infra_store = useInfraStore()
        infra_store.init_microservices()
        useRuntimeConfig().public.SITE_BRANCH = "/test"
        useRuntimeConfig().public.PROJECT = "/project"
        infra_store.app_mode = appMode.appMode.CLOUD
        const geode_store = useGeodeStore()
        geode_store.$patch({ protocol: "https", port: 443 })
        expect(infra_store.lambda_url).toBe(
          "https://api.geode-solutions.com:443/test/project/createbackend",
        )
      })
    })
    describe("status", () => {
      test("test geode false & viewer false", () => {
        const infra_store = useInfraStore()
        infra_store.init_microservices()
        const geode_store = useGeodeStore()
        const viewer_store = useViewerStore()
        geode_store.$patch({ status: Status.NOT_CONNECTED })
        viewer_store.$patch({ status: Status.NOT_CONNECTED })
        expect(infra_store.microservices_connected).toBe(false)
      })
      test("test geode true & viewer false", () => {
        const infra_store = useInfraStore()
        infra_store.init_microservices()
        const geode_store = useGeodeStore()
        const viewer_store = useViewerStore()
        geode_store.$patch({ status: Status.CONNECTED })
        viewer_store.$patch({ status: Status.NOT_CONNECTED })
        expect(infra_store.microservices_connected).toBe(false)
      })
      test("test geode false & viewer true", () => {
        const infra_store = useInfraStore()
        infra_store.init_microservices()
        const geode_store = useGeodeStore()
        const viewer_store = useViewerStore()
        geode_store.$patch({ status: Status.NOT_CONNECTED })
        viewer_store.$patch({ status: Status.CONNECTED })
        expect(infra_store.microservices_connected).toBe(false)
      })
      test("test geode true & viewer true", () => {
        const infra_store = useInfraStore()
        infra_store.init_microservices()
        const geode_store = useGeodeStore()
        const viewer_store = useViewerStore()
        geode_store.$patch({ status: Status.CONNECTED })
        viewer_store.$patch({ status: Status.CONNECTED })
        expect(infra_store.microservices_connected).toBe(true)
      })
    })

    describe("is_busy", () => {
      test("test geode false & viewer false", () => {
        const infra_store = useInfraStore()
        const geode_store = useGeodeStore()
        const viewer_store = useViewerStore()
        geode_store.is_busy = false
        viewer_store.is_busy = false
        infra_store.init_microservices()

        expect(infra_store.microservices_busy).toBe(false)
      })
      test("test geode true & viewer false", () => {
        const infra_store = useInfraStore()
        const geode_store = useGeodeStore()
        const viewer_store = useViewerStore()
        geode_store.is_busy = true
        viewer_store.is_busy = false
        infra_store.init_microservices()
        expect(infra_store.microservices_busy).toBe(true)
      })
      test("test geode false & viewer true", () => {
        const infra_store = useInfraStore()
        const geode_store = useGeodeStore()
        const viewer_store = useViewerStore()
        geode_store.is_busy = false
        viewer_store.is_busy = true
        infra_store.init_microservices()
        expect(infra_store.microservices_busy).toBe(true)
      })
      test("test geode true & viewer true", () => {
        const infra_store = useInfraStore()
        const geode_store = useGeodeStore()
        const viewer_store = useViewerStore()
        geode_store.is_busy = true
        viewer_store.is_busy = true
        infra_store.init_microservices()
        expect(infra_store.microservices_busy).toBe(true)
      })
    })
  })

  describe("actions", () => {
    describe("create_backend", () => {
      test("test without end-point", async () => {
        const infra_store = useInfraStore()
        infra_store.init_microservices()
        const geode_store = useGeodeStore()
        const viewer_store = useViewerStore()
        await infra_store.create_backend()
        expect(infra_store.status).toBe(Status.NOT_CREATED)
        expect(geode_store.status).toBe(Status.NOT_CONNECTED)
        expect(viewer_store.status).toBe(Status.NOT_CONNECTED)
      })
      // test("test with end-point", async () => {
      //   const infra_store = useInfraStore()
      //   const geode_store = useGeodeStore()
      //   const viewer_store = useViewerStore()
      //   const feedback_store = useFeedbackStore()

      //   registerEndpoint(infra_store.lambda_url, {
      //     method: "POST",
      //     handler: () => ({ ID: "123456" }),
      //   })
      //   await infra_store.create_backend()
      //   expect(infra_store.status).toBe(Status.CREATED)
      //   expect(geode_store.status).toBe(Status.NOT_CONNECTED)
      //   expect(viewer_store.status).toBe(Status.NOT_CONNECTED)
      //   expect(feedback_store.server_error).toBe(true)
      // })
    })
  })
})
