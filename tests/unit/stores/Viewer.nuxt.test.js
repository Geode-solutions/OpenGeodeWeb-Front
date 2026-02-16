// Global imports
import { describe, expect, expectTypeOf, test, vi } from "vitest"
import { WebSocket } from "ws"
import { createTestingPinia } from "@pinia/testing"
import { setActivePinia } from "pinia"

// Local imports
import { appMode } from "@ogw_front/utils/app_mode"
import { useInfraStore } from "@ogw_front/stores/infra"
import { useViewerStore } from "@ogw_front/stores/viewer"

// CONSTANTS
const PORT_443 = "443"
const PORT_8080 = "8080"
const PORT_1234 = "1234"
const ID_VAL = "123456"
const L1 = 1
const L0 = 0
const LN1 = -1

// Mock navigator.locks API
const mockLockRequest = vi.fn().mockImplementation((name, fn) => fn({ name }))

vi.stubGlobal("navigator", {
  ...navigator,
  locks: {
    request: mockLockRequest,
  },
})

function setup() {
  const pinia = createTestingPinia({ stubActions: false, createSpy: vi.fn })
  setActivePinia(pinia)
  globalThis.WebSocket = WebSocket
}

describe("viewer store state", () => {
  test("initial state", () => {
    setup()
    const viewerStore = useViewerStore()
    expectTypeOf(viewerStore.default_local_port).toBeString()
    expectTypeOf(viewerStore.client).toEqualTypeOf({})
    expectTypeOf(viewerStore.picking_mode).toBeBoolean()
    expectTypeOf(viewerStore.picked_point).toEqualTypeOf({ x: undefined, y: undefined })
    expectTypeOf(viewerStore.picked_point).toBeNumber()
    expectTypeOf(viewerStore.status).toBeString()
  })
})

describe("viewer store mode getters", () => {
  test("protocol and domain mapping", () => {
    setup()
    const infra = useInfraStore()
    const viewer = useViewerStore()

    infra.app_mode = appMode.CLOUD
    expect(viewer.protocol).toBe("wss")
    infra.app_mode = appMode.BROWSER
    expect(viewer.protocol).toBe("ws")
    infra.app_mode = appMode.DESKTOP
    expect(viewer.protocol).toBe("ws")
  })

  test("port mapping", () => {
    setup()
    const infra = useInfraStore()
    const viewer = useViewerStore()

    infra.app_mode = appMode.CLOUD
    expect(viewer.port).toBe(PORT_443)
    infra.app_mode = appMode.BROWSER
    expect(viewer.port).toBe(viewer.default_local_port)
    infra.app_mode = appMode.DESKTOP
    expect(viewer.port).toBe(viewer.default_local_port)

    viewer.default_local_port = PORT_8080
    expect(viewer.port).toBe(PORT_8080)
  })
})

describe("viewer store url and busy getters", () => {
  test("base_url construction", () => {
    setup()
    const infra = useInfraStore()
    const viewer = useViewerStore()

    infra.app_mode = appMode.DESKTOP
    infra.domain_name = "localhost"
    expect(viewer.base_url).toBe(`ws://localhost:${PORT_1234}/ws`)

    infra.app_mode = appMode.CLOUD
    infra.ID = ID_VAL
    infra.domain_name = "example.com"
    expect(viewer.base_url).toBe(
      `wss://example.com:${PORT_443}/${ID_VAL}/viewer/ws`,
    )
  })

  test("base_url error", () => {
    setup()
    const infra = useInfraStore()
    const viewer = useViewerStore()
    infra.app_mode = appMode.CLOUD
    infra.ID = ""
    infra.domain_name = "example.com"
    expect(() => viewer.base_url).toThrow("ID must not be empty in cloud mode")
  })

  test("busy status mapping", () => {
    setup()
    const viewer = useViewerStore()
    viewer.request_counter = L1
    expect(viewer.is_busy).toBeTruthy()
    viewer.request_counter = L0
    expect(viewer.is_busy).toBeFalsy()
  })
})

describe("viewer store actions", () => {
  test("toggle_picking_mode", async () => {
    setup()
    const viewer = useViewerStore()
    await viewer.toggle_picking_mode(true)
    expect(viewer.picking_mode).toBeTruthy()
  })

  test("request counter updates", async () => {
    setup()
    const viewer = useViewerStore()
    await viewer.start_request()
    expect(viewer.request_counter).toBe(L1)
    await viewer.stop_request()
    expect(viewer.request_counter).toBe(L0)
    await viewer.stop_request()
    expect(viewer.request_counter).toBe(LN1)
  })
})
