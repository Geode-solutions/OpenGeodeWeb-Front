// Global imports
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  expectTypeOf,
  test,
  vi,
} from "vitest"

import { WebSocket } from "ws"

// Local imports
import { appMode } from "@ogw_front/utils/app_mode"
import { setupActivePinia } from "../../utils"
import { useInfraStore } from "@ogw_front/stores/infra"
import { useViewerStore } from "@ogw_front/stores/viewer"

// CONSTANTS
const PORT_443 = "443"
const PORT_8080 = "8080"
const PORT_1234 = "1234"
const ID_VAL = "123456"
const EXPECTED_ONE_REQUEST = 1
const EXPECTED_ZERO_REQUESTS = 0
const EXPECTED_NEGATIVE_ONE_REQUEST = -1

// Mock navigator.locks API
const mockLockRequest = vi
  .fn()
  .mockImplementation((name, task) => task({ name }))

vi.stubGlobal("navigator", {
  ...navigator,
  locks: {
    request: mockLockRequest,
  },
})

beforeAll(() => {
  globalThis.WebSocket = WebSocket
})

afterAll(() => {
  delete globalThis.WebSocket
})

beforeEach(() => {
  setupActivePinia()
})

describe("viewer store state", () => {
  test("initial state", () => {
    const viewerStore = useViewerStore()
    expectTypeOf(viewerStore.default_local_port).toBeString()
    expectTypeOf(viewerStore.client).toEqualTypeOf({})
    expectTypeOf(viewerStore.picking_mode).toBeBoolean()
    expectTypeOf(viewerStore.picked_point).toEqualTypeOf({
      x: undefined,
      y: undefined,
    })
    expectTypeOf(viewerStore.picked_point).toBeNumber()
    expectTypeOf(viewerStore.status).toBeString()
  })
})

describe("viewer store mode getters", () => {
  test("protocol and domain mapping", () => {
    const infraStore = useInfraStore()
    const viewerStore = useViewerStore()

    infraStore.app_mode = appMode.CLOUD
    expect(viewerStore.protocol).toBe("wss")
    infraStore.app_mode = appMode.BROWSER
    expect(viewerStore.protocol).toBe("ws")
    infraStore.app_mode = appMode.DESKTOP
    expect(viewerStore.protocol).toBe("ws")
  })

  test("port mapping", () => {
    const infraStore = useInfraStore()
    const viewerStore = useViewerStore()

    infraStore.app_mode = appMode.CLOUD
    expect(viewerStore.port).toBe(PORT_443)
    infraStore.app_mode = appMode.BROWSER
    expect(viewerStore.port).toBe(viewerStore.default_local_port)
    infraStore.app_mode = appMode.DESKTOP
    expect(viewerStore.port).toBe(viewerStore.default_local_port)

    viewerStore.default_local_port = PORT_8080
    expect(viewerStore.port).toBe(PORT_8080)
  })
})

describe("viewer store url and busy getters", () => {
  test("base_url construction", () => {
    const infraStore = useInfraStore()
    const viewerStore = useViewerStore()

    infraStore.app_mode = appMode.DESKTOP
    infraStore.domain_name = "localhost"
    expect(viewerStore.base_url).toBe(`ws://localhost:${PORT_1234}/ws`)

    infraStore.app_mode = appMode.CLOUD
    infraStore.ID = ID_VAL
    infraStore.domain_name = "example.com"
    expect(viewerStore.base_url).toBe(
      `wss://example.com:${PORT_443}/${ID_VAL}/viewer/ws`,
    )
  })

  test("base_url error", () => {
    const infraStore = useInfraStore()
    const viewerStore = useViewerStore()
    infraStore.app_mode = appMode.CLOUD
    infraStore.ID = ""
    infraStore.domain_name = "example.com"
    expect(() => viewerStore.base_url).toThrow(
      "ID must not be empty in cloud mode",
    )
  })

  test("busy status mapping", () => {
    const viewerStore = useViewerStore()
    viewerStore.request_counter = EXPECTED_ONE_REQUEST
    expect(viewerStore.is_busy).toBeTruthy()
    viewerStore.request_counter = EXPECTED_ZERO_REQUESTS
    expect(viewerStore.is_busy).toBeFalsy()
  })
})

describe("viewer store actions", () => {
  test("toggle_picking_mode", async () => {
    const viewerStore = useViewerStore()
    await viewerStore.toggle_picking_mode(true)
    expect(viewerStore.picking_mode).toBeTruthy()
  })

  test("request counter updates", async () => {
    const viewerStore = useViewerStore()
    await viewerStore.start_request()
    expect(viewerStore.request_counter).toBe(EXPECTED_ONE_REQUEST)
    await viewerStore.stop_request()
    expect(viewerStore.request_counter).toBe(EXPECTED_ZERO_REQUESTS)
    await viewerStore.stop_request()
    expect(viewerStore.request_counter).toBe(EXPECTED_NEGATIVE_ONE_REQUEST)
  })
})
