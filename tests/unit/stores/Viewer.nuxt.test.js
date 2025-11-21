// Global imports
import path from "path"

// Third party imports
import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"
import {
  afterAll,
  beforeAll,
  describe,
  test,
  expect,
  expectTypeOf,
  beforeEach,
  vi,
} from "vitest"

import { WebSocket } from "ws"

// Local imports
import { useViewerStore } from "@ogw_front/stores/viewer"
import { useInfraStore } from "@ogw_front/stores/infra"

import { appMode } from "@ogw_front/utils/app_mode"
import Status from "@ogw_front/utils/status"

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

beforeAll(() => {
  global.WebSocket = WebSocket
})

afterAll(() => {
  delete global.WebSocket
})

beforeEach(() => {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })
  setActivePinia(pinia)
})

describe("Viewer Store", () => {
  describe("state", () => {
    test("initial state", () => {
      const viewer_store = useViewerStore()
      expectTypeOf(viewer_store.default_local_port).toBeString()
      expectTypeOf(viewer_store.client).toEqualTypeOf({})
      expectTypeOf(viewer_store.picking_mode).toBeBoolean()
      expectTypeOf(viewer_store.picked_point).toEqualTypeOf({
        x: null,
        y: null,
      })
      expectTypeOf(viewer_store.picked_point).toBeNumber()
      expectTypeOf(viewer_store.status).toBeString()
    })
  })

  describe("getters", () => {
    describe("protocol", () => {
      test("test app_mode CLOUD", () => {
        const infra_store = useInfraStore()
        const viewer_store = useViewerStore()
        infra_store.app_mode = appMode.CLOUD
        expect(viewer_store.protocol).toBe("wss")
      })
      test("test app_mode BROWSER", () => {
        const infra_store = useInfraStore()
        const viewer_store = useViewerStore()
        infra_store.app_mode = appMode.BROWSER
        expect(viewer_store.protocol).toBe("ws")
      })
      test("test app_mode DESKTOP", () => {
        const infra_store = useInfraStore()
        const viewer_store = useViewerStore()
        infra_store.app_mode = appMode.DESKTOP
        expect(viewer_store.protocol).toBe("ws")
      })
    })

    describe("port", () => {
      test("test app_mode CLOUD", () => {
        const infra_store = useInfraStore()
        const viewer_store = useViewerStore()
        infra_store.app_mode = appMode.CLOUD
        expect(viewer_store.port).toBe("443")
      })
      test("test app_mode BROWSER", () => {
        const infra_store = useInfraStore()
        const viewer_store = useViewerStore()
        infra_store.app_mode = appMode.BROWSER
        expect(viewer_store.port).toBe(viewer_store.default_local_port)
      })
      test("test app_mode DESKTOP", () => {
        const infra_store = useInfraStore()
        const viewer_store = useViewerStore()
        infra_store.app_mode = appMode.DESKTOP
        expect(viewer_store.port).toBe(viewer_store.default_local_port)
      })

      test("test override default_local_port", () => {
        const infra_store = useInfraStore()
        const viewer_store = useViewerStore()
        infra_store.app_mode = appMode.DESKTOP
        viewer_store.default_local_port = "8080"
        expect(viewer_store.port).toBe("8080")
      })
    })
    describe("base_url", () => {
      test("test app_mode DESKTOP", () => {
        const infra_store = useInfraStore()
        infra_store.app_mode = appMode.DESKTOP
        infra_store.domain_name = "localhost"
        // expect(viewer_store.base_url).toBe("ws://localhost:1234/ws")
      })

      test("test app_mode CLOUD", () => {
        const infra_store = useInfraStore()
        const viewer_store = useViewerStore()
        infra_store.app_mode = appMode.CLOUD
        infra_store.ID = "123456"
        infra_store.domain_name = "example.com"
        expect(viewer_store.base_url).toBe(
          "wss://example.com:443/123456/viewer/ws",
        )
      })

      test("test app_mode CLOUD, ID empty", () => {
        const infra_store = useInfraStore()
        const viewer_store = useViewerStore()
        infra_store.app_mode = appMode.CLOUD
        infra_store.ID = ""
        infra_store.domain_name = "example.com"
        expect(() => viewer_store.base_url).toThrowError(
          "ID must not be empty in cloud mode",
        )
      })
    })
    describe("is_busy", () => {
      test("test is_busy", () => {
        const viewer_store = useViewerStore()
        viewer_store.request_counter = 1
        expect(viewer_store.is_busy).toBe(true)
      })
      test("test not is_busy", () => {
        const viewer_store = useViewerStore()
        viewer_store.request_counter = 0
        expect(viewer_store.is_busy).toBe(false)
      })
    })
  })
  describe("actions", () => {
    // test("ws_connect", async () => {
    //   const infra_store = useInfraStore()
    //   const viewer_store = useViewerStore()
    //   infra_store.app_mode = appMode.BROWSER
    //   const viewer_path = path.join(
    //     executable_path(
    //       path.join("tests", "integration", "microservices", "viewer"),
    //     ),
    //     executable_name("opengeodeweb_viewer"),
    //   )
    //   const viewer_port = await run_viewer(viewer_path, {
    //     port: 1234,
    //     data_folder_path: "./data",
    //   })
    //   viewer_store.default_local_port = viewer_port
    //   await viewer_store.ws_connect()
    //   expect(viewer_store.status).toBe(Status.CONNECTED)
    // }, 10000)
    describe("toggle_picking_mode", () => {
      test("test true", async () => {
        const viewer_store = useViewerStore()
        await viewer_store.toggle_picking_mode(true)
        expect(viewer_store.picking_mode).toBe(true)
      })
    })
    describe("start_request", () => {
      test("test increment", async () => {
        const viewer_store = useViewerStore()
        await viewer_store.start_request()
        expect(viewer_store.request_counter).toBe(1)
      })
    })
    describe("stop_request", () => {
      test("test decrement", async () => {
        const viewer_store = useViewerStore()
        await viewer_store.stop_request()
        expect(viewer_store.request_counter).toBe(-1)
      })
    })
  })
})
