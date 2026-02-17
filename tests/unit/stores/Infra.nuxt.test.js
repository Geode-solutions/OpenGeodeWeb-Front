// Global imports
import { describe, expect, expectTypeOf, test, vi } from "vitest"
import { createTestingPinia } from "@pinia/testing"
import { registerEndpoint } from "@nuxt/test-utils/runtime"
import { setActivePinia } from "pinia"

// Local imports
import Status from "@ogw_front/utils/status"
import { appMode } from "@ogw_front/utils/app_mode"
import { useGeodeStore } from "@ogw_front/stores/geode"
import { useInfraStore } from "@ogw_front/stores/infra"
import { useLambdaStore } from "@ogw_front/stores/lambda"
import { useViewerStore } from "@ogw_front/stores/viewer"

// CONSTANTS
const ID_VAL = "123456"
const EXPECTED_ONE_REQUEST = 1
const EXPECTED_TWO_REQUESTS = 2
const EXPECTED_NO_REQUEST = 0
const EXPECTED_FIRST_INDEX = 0
const LOCALHOST = "localhost"
const CLOUD_DOMAIN = "api.geode-solutions.com"

// Mock navigator.locks API
const mockLockRequest = vi.fn().mockImplementation((name, task) => task({ name }))

vi.stubGlobal("navigator", {
  ...navigator,
  locks: {
    request: mockLockRequest,
  },
})

function setup() {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })
  setActivePinia(pinia)
}

describe("infra store state", () => {
  test("initial state", () => {
    setup()
    const infraStore = useInfraStore()
    expectTypeOf(infraStore.ID).toBeString()
    expectTypeOf(infraStore.is_captcha_validated).toBeBoolean()
    expectTypeOf(infraStore.status).toBeString()
  })
})

describe("infra store mode getters", () => {
  test("app_mode types", () => {
    setup()
    const infraStore = useInfraStore()
    expectTypeOf(infraStore.app_mode).toBeString()
  })

  test("domain_name BROWSER/DESKTOP", () => {
    setup()
    const infraStore = useInfraStore()
    infraStore.app_mode = appMode.BROWSER
    expect(infraStore.domain_name).toBe(LOCALHOST)
    infraStore.app_mode = appMode.DESKTOP
    expect(infraStore.domain_name).toBe(LOCALHOST)
  })

  test("domain_name CLOUD", () => {
    setup()
    const infraStore = useInfraStore()
    infraStore.app_mode = appMode.CLOUD
    expect(infraStore.domain_name).toBe(CLOUD_DOMAIN)
  })
})

describe("infra store connectivity getters", () => {
  test("no microservices registered", () => {
    setup()
    const infraStore = useInfraStore()
    expect(infraStore.microservices_connected).toBeTruthy()
  })

  test("partial and full connectivity", () => {
    setup()
    const infraStore = useInfraStore()
    const geodeStore = useGeodeStore()
    const viewerStore = useViewerStore()
    const mockApi = { request: vi.fn(), connect: vi.fn(), launch: vi.fn() }
    infraStore.register_microservice(geodeStore, mockApi)
    infraStore.register_microservice(viewerStore, mockApi)

    geodeStore.$patch({ status: Status.NOT_CONNECTED })
    viewerStore.$patch({ status: Status.NOT_CONNECTED })
    expect(infraStore.microservices_connected).toBeFalsy()

    geodeStore.$patch({ status: Status.CONNECTED })
    expect(infraStore.microservices_connected).toBeFalsy()

    viewerStore.$patch({ status: Status.CONNECTED })
    expect(infraStore.microservices_connected).toBeTruthy()
  })
})

describe("infra store busy getters", () => {
  test("busy status mapping", () => {
    setup()
    const infraStore = useInfraStore()
    const geodeStore = useGeodeStore()
    const viewerStore = useViewerStore()
    const mockApi = { request: vi.fn(), connect: vi.fn(), launch: vi.fn() }
    expect(infraStore.microservices_busy).toBeFalsy()

    infraStore.register_microservice(geodeStore, mockApi)
    infraStore.register_microservice(viewerStore, mockApi)
    geodeStore.$patch({ request_counter: EXPECTED_NO_REQUEST })
    viewerStore.$patch({ request_counter: EXPECTED_NO_REQUEST })
    expect(infraStore.microservices_busy).toBeFalsy()

    geodeStore.$patch({ request_counter: EXPECTED_ONE_REQUEST })
    expect(infraStore.microservices_busy).toBeTruthy()

    geodeStore.$patch({ request_counter: EXPECTED_NO_REQUEST })
    viewerStore.$patch({ request_counter: EXPECTED_ONE_REQUEST })
    expect(infraStore.microservices_busy).toBeTruthy()
  })
})

describe("infra store registration actions", () => {
  test("register microservices", () => {
    setup()
    const infraStore = useInfraStore()
    const geodeStore = useGeodeStore()
    const viewerStore = useViewerStore()
    const mockApi = { request: vi.fn(), connect: vi.fn(), launch: vi.fn() }

    infraStore.register_microservice(geodeStore, mockApi)
    expect(infraStore.microservices).toHaveLength(EXPECTED_ONE_REQUEST)
    expect(infraStore.microservices[EXPECTED_FIRST_INDEX].$id).toBe("geode")

    infraStore.register_microservice(viewerStore, mockApi)
    expect(infraStore.microservices).toHaveLength(EXPECTED_TWO_REQUESTS)
  })
})

describe("infra store backend actions", () => {
  test("create_backend BROWSER", async () => {
    setup()
    const infraStore = useInfraStore()
    infraStore.app_mode = appMode.BROWSER
    await infraStore.create_backend()
    expect(infraStore.status).toBe(Status.CREATED)
  })

  test("create_backend CLOUD", async () => {
    setup()
    const infraStore = useInfraStore()
    const geodeStore = useGeodeStore()
    const viewerStore = useViewerStore()
    const lambdaStore = useLambdaStore()
    infraStore.app_mode = appMode.CLOUD
    registerEndpoint(lambdaStore.base_url, {
      method: "POST",
      handler: () => ({ ID: ID_VAL }),
    })
    await infraStore.create_backend()
    expect(infraStore.status).toBe(Status.CREATED)
    expect(infraStore.ID).toBe(ID_VAL)
    expect(geodeStore.status).toBe(Status.NOT_CONNECTED)
    expect(viewerStore.status).toBe(Status.NOT_CONNECTED)
  })
})
