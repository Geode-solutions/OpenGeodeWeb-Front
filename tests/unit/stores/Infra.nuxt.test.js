// Global imports

// Third party imports
import { registerEndpoint } from "@nuxt/test-utils/runtime"
import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"
import { beforeEach, describe, expect, expectTypeOf, test, vi } from "vitest"
// Local imports
import Status from "@ogw_front/utils/status.js"
import { appMode } from "@ogw_front/utils/app_mode"

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
        infra_store.app_mode = appMode.BROWSER
        expect(infra_store.domain_name).toBe("localhost")
      })
      test("test app_mode DESKTOP", () => {
        const infra_store = useInfraStore()
        infra_store.app_mode = appMode.DESKTOP
        expect(infra_store.domain_name).toBe("localhost")
      })
      test("test app_mode CLOUD", () => {
        const infra_store = useInfraStore()
        infra_store.app_mode = appMode.CLOUD
        expect(infra_store.domain_name).toBe("api.geode-solutions.com")
      })
    })

    describe("microservices_connected", () => {
      test("test no microservices registered", () => {
        const infra_store = useInfraStore()
        expect(infra_store.microservices_connected).toBe(true)
      })
      test("test geode false & viewer false", () => {
        const infra_store = useInfraStore()
        const geodeStore = useGeodeStore()
        const viewerStore = useViewerStore()

        infra_store.register_microservice(geodeStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })
        infra_store.register_microservice(viewerStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })

        geodeStore.$patch({ status: Status.NOT_CONNECTED })
        viewerStore.$patch({ status: Status.NOT_CONNECTED })
        expect(infra_store.microservices_connected).toBe(false)
      })
      test("test geode true & viewer false", () => {
        const infra_store = useInfraStore()
        const geodeStore = useGeodeStore()
        const viewerStore = useViewerStore()

        infra_store.register_microservice(geodeStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })
        infra_store.register_microservice(viewerStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })

        geodeStore.$patch({ status: Status.CONNECTED })
        viewerStore.$patch({ status: Status.NOT_CONNECTED })
        expect(infra_store.microservices_connected).toBe(false)
      })
      test("test geode false & viewer true", () => {
        const infra_store = useInfraStore()
        const geodeStore = useGeodeStore()
        const viewerStore = useViewerStore()

        infra_store.register_microservice(geodeStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })
        infra_store.register_microservice(viewerStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })

        geodeStore.$patch({ status: Status.NOT_CONNECTED })
        viewerStore.$patch({ status: Status.CONNECTED })
        expect(infra_store.microservices_connected).toBe(false)
      })
      test("test geode true & viewer true", () => {
        const infra_store = useInfraStore()
        const geodeStore = useGeodeStore()
        const viewerStore = useViewerStore()

        infra_store.register_microservice(geodeStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })
        infra_store.register_microservice(viewerStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })

        geodeStore.$patch({ status: Status.CONNECTED })
        viewerStore.$patch({ status: Status.CONNECTED })
        expect(infra_store.microservices_connected).toBe(true)
      })
    })

    describe("microservices_busy", () => {
      test("test no microservices registered", () => {
        const infra_store = useInfraStore()
        expect(infra_store.microservices_busy).toBe(false)
      })
      test("test geode false & viewer false", () => {
        const infra_store = useInfraStore()
        const geodeStore = useGeodeStore()
        const viewerStore = useViewerStore()

        infra_store.register_microservice(geodeStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })
        infra_store.register_microservice(viewerStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })

        geodeStore.$patch({ request_counter: 0 })
        viewerStore.$patch({ request_counter: 0 })
        expect(infra_store.microservices_busy).toBe(false)
      })
      test("test geode true & viewer false", () => {
        const infra_store = useInfraStore()
        const geodeStore = useGeodeStore()
        const viewerStore = useViewerStore()

        infra_store.register_microservice(geodeStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })
        infra_store.register_microservice(viewerStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })

        geodeStore.$patch({ request_counter: 1 })
        viewerStore.$patch({ request_counter: 0 })
        expect(infra_store.microservices_busy).toBe(true)
      })
      test("test geode false & viewer true", () => {
        const infra_store = useInfraStore()
        const geodeStore = useGeodeStore()
        const viewerStore = useViewerStore()

        infra_store.register_microservice(geodeStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })
        infra_store.register_microservice(viewerStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })

        geodeStore.$patch({ request_counter: 0 })
        viewerStore.$patch({ request_counter: 1 })
        expect(infra_store.microservices_busy).toBe(true)
      })
      test("test geode true & viewer true", () => {
        const infra_store = useInfraStore()
        const geodeStore = useGeodeStore()
        const viewerStore = useViewerStore()

        infra_store.register_microservice(geodeStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })
        infra_store.register_microservice(viewerStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })

        geodeStore.$patch({ request_counter: 1 })
        viewerStore.$patch({ request_counter: 1 })
        expect(infra_store.microservices_busy).toBe(true)
      })
    })
  })

  describe("actions", () => {
    describe("register_microservice", () => {
      test("register geode microservice", () => {
        const infra_store = useInfraStore()
        const geodeStore = useGeodeStore()

        infra_store.register_microservice(geodeStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })

        expect(infra_store.microservices.length).toBe(1)
        expect(infra_store.microservices[0].$id).toBe("geode")
      })

      test("register multiple microservices", () => {
        const infra_store = useInfraStore()
        const geodeStore = useGeodeStore()
        const viewerStore = useViewerStore()

        infra_store.register_microservice(geodeStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })

        infra_store.register_microservice(viewerStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })

        expect(infra_store.microservices.length).toBe(2)
      })
    })

    describe("create_backend", () => {
      test("test without microservices", async () => {
        const infra_store = useInfraStore()
        infra_store.app_mode = appMode.BROWSER
        await infra_store.create_backend()
        expect(infra_store.status).toBe(Status.CREATED)
      })
      test("test with end-point", async () => {
        const infra_store = useInfraStore()
        const geodeStore = useGeodeStore()
        const viewerStore = useViewerStore()
        const feedback_store = useFeedbackStore()
        const lambdaStore = useLambdaStore()

        infra_store.app_mode = appMode.CLOUD
        const ID = "123456"
        registerEndpoint(lambdaStore.base_url, {
          method: "POST",
          handler: () => ({ ID }),
        })
        await infra_store.create_backend()
        expect(infra_store.status).toBe(Status.CREATED)
        expect(infra_store.ID).toBe(ID)

        expect(geodeStore.status).toBe(Status.NOT_CONNECTED)
        expect(viewerStore.status).toBe(Status.NOT_CONNECTED)
      })
    })
  })
})
