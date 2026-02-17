// Third party imports
import { beforeEach, describe, expect, expectTypeOf, test, vi } from "vitest"
import { registerEndpoint } from "@nuxt/test-utils/runtime"

// Local imports
import Status from "@ogw_front/utils/status"
import { appMode } from "@ogw_front/utils/app_mode"
import { setupActivePinia } from "../../utils"
import { useGeodeStore } from "@ogw_front/stores/geode"
import { useInfraStore } from "@ogw_front/stores/infra"
import { useLambdaStore } from "@ogw_front/stores/lambda"
import { useViewerStore } from "@ogw_front/stores/viewer"


// Mock navigator.locks API
const mockLockRequest = vi.fn().mockImplementation(async (name, handler) => await handler({ name }))

vi.stubGlobal("navigator", {
  ...navigator,
  locks: {
    request: mockLockRequest,
  },
})

beforeEach(() => {
  setupActivePinia()
})

describe("Infra Store", () => {
  describe("state", () => {
    test("initial state", () => {
      const infraStore = useInfraStore()
      expectTypeOf(infraStore.ID).toBeString()
      expectTypeOf(infraStore.is_captcha_validated).toBeBoolean()
      expectTypeOf(infraStore.status).toBeString()
    })
  })
  describe("getters", () => {
    describe("app_mode", () => {
      test("test type", () => {
        const infraStore = useInfraStore()
        expectTypeOf(infraStore.app_mode).toBeString()
      })
    })

    describe("domain_name", () => {
      test("test app_mode BROWSER", () => {
        const infraStore = useInfraStore()
        infraStore.app_mode = appMode.BROWSER
        expect(infraStore.domain_name).toBe("localhost")
      })
      test("test app_mode DESKTOP", () => {
        const infraStore = useInfraStore()
        infraStore.app_mode = appMode.DESKTOP
        expect(infraStore.domain_name).toBe("localhost")
      })
      test("test app_mode CLOUD", () => {
        const infraStore = useInfraStore()
        infraStore.app_mode = appMode.CLOUD
        expect(infraStore.domain_name).toBe("api.geode-solutions.com")
      })
    })

    describe("microservices_connected", () => {
      test("test no microservices registered", () => {
        const infraStore = useInfraStore()
        expect(infraStore.microservices_connected).toBeTruthy()
      })
      test("test geode false & viewer false", () => {
        const infraStore = useInfraStore()
        const geodeStore = useGeodeStore()
        const viewerStore = useViewerStore()

        infraStore.register_microservice(geodeStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })
        infraStore.register_microservice(viewerStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })

        geodeStore.$patch({ status: Status.NOT_CONNECTED })
        viewerStore.$patch({ status: Status.NOT_CONNECTED })
        expect(infraStore.microservices_connected).toBeFalsy()
      })
      test("test geode true & viewer false", () => {
        const infraStore = useInfraStore()
        const geodeStore = useGeodeStore()
        const viewerStore = useViewerStore()

        infraStore.register_microservice(geodeStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })
        infraStore.register_microservice(viewerStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })

        geodeStore.$patch({ status: Status.CONNECTED })
        viewerStore.$patch({ status: Status.NOT_CONNECTED })
        expect(infraStore.microservices_connected).toBeFalsy()
      })
      test("test geode false & viewer true", () => {
        const infraStore = useInfraStore()
        const geodeStore = useGeodeStore()
        const viewerStore = useViewerStore()

        infraStore.register_microservice(geodeStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })
        infraStore.register_microservice(viewerStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })

        geodeStore.$patch({ status: Status.NOT_CONNECTED })
        viewerStore.$patch({ status: Status.CONNECTED })
        expect(infraStore.microservices_connected).toBeFalsy()
      })
      test("test geode true & viewer true", () => {
        const infraStore = useInfraStore()
        const geodeStore = useGeodeStore()
        const viewerStore = useViewerStore()

        infraStore.register_microservice(geodeStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })
        infraStore.register_microservice(viewerStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })

        geodeStore.$patch({ status: Status.CONNECTED })
        viewerStore.$patch({ status: Status.CONNECTED })
        expect(infraStore.microservices_connected).toBeTruthy()
      })
    })

    describe("microservices_busy", () => {
      test("test no microservices registered", () => {
        const infraStore = useInfraStore()
        expect(infraStore.microservices_busy).toBeFalsy()
      })
      test("test geode false & viewer false", () => {
        const infraStore = useInfraStore()
        const geodeStore = useGeodeStore()
        const viewerStore = useViewerStore()

        infraStore.register_microservice(geodeStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })
        infraStore.register_microservice(viewerStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })

        geodeStore.$patch({ request_counter: 0 })
        viewerStore.$patch({ request_counter: 0 })
        expect(infraStore.microservices_busy).toBeFalsy()
      })
      test("test geode true & viewer false", () => {
        const infraStore = useInfraStore()
        const geodeStore = useGeodeStore()
        const viewerStore = useViewerStore()

        infraStore.register_microservice(geodeStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })
        infraStore.register_microservice(viewerStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })

        geodeStore.$patch({ request_counter: 1 })
        viewerStore.$patch({ request_counter: 0 })
        expect(infraStore.microservices_busy).toBeTruthy()
      })
      test("test geode false & viewer true", () => {
        const infraStore = useInfraStore()
        const geodeStore = useGeodeStore()
        const viewerStore = useViewerStore()

        infraStore.register_microservice(geodeStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })
        infraStore.register_microservice(viewerStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })

        geodeStore.$patch({ request_counter: 0 })
        viewerStore.$patch({ request_counter: 1 })
        expect(infraStore.microservices_busy).toBeTruthy()
      })
      test("test geode true & viewer true", () => {
        const infraStore = useInfraStore()
        const geodeStore = useGeodeStore()
        const viewerStore = useViewerStore()

        infraStore.register_microservice(geodeStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })
        infraStore.register_microservice(viewerStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })

        geodeStore.$patch({ request_counter: 1 })
        viewerStore.$patch({ request_counter: 1 })
        expect(infraStore.microservices_busy).toBeTruthy()
      })
    })
  })

  describe("actions", () => {
    describe("register_microservice", () => {
      test("register geode microservice", () => {
        const infraStore = useInfraStore()
        const geodeStore = useGeodeStore()

        infraStore.register_microservice(geodeStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })

        expect(infraStore.microservices.length).toBe(1)
        expect(infraStore.microservices[0].$id).toBe("geode")
      })

      test("register multiple microservices", () => {
        const infraStore = useInfraStore()
        const geodeStore = useGeodeStore()
        const viewerStore = useViewerStore()

        infraStore.register_microservice(geodeStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })

        infraStore.register_microservice(viewerStore, {
          request: vi.fn(),
          connect: vi.fn(),
          launch: vi.fn(),
        })

        expect(infraStore.microservices.length).toBe(2)
      })
    })

    describe("create_backend", () => {
      test("test without microservices", async () => {
        const infraStore = useInfraStore()
        infraStore.app_mode = appMode.BROWSER
        await infraStore.create_backend()
        expect(infraStore.status).toBe(Status.CREATED)
      })
      test("test with end-point", async () => {
        const infraStore = useInfraStore()
        const geodeStore = useGeodeStore()
        const viewerStore = useViewerStore()
        const lambdaStore = useLambdaStore()

        infraStore.app_mode = appMode.CLOUD
        const ID = "123456"
        registerEndpoint(lambdaStore.base_url, {
          method: "POST",
          handler: () => ({ ID }),
        })
        await infraStore.create_backend()
        expect(infraStore.status).toBe(Status.CREATED)
        expect(infraStore.ID).toBe(ID)

        expect(geodeStore.status).toBe(Status.NOT_CONNECTED)
        expect(viewerStore.status).toBe(Status.NOT_CONNECTED)
      })
    })
  })
})