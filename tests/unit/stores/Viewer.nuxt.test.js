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
      const viewerStore = useViewerStore()
      expectTypeOf(viewerStore.default_local_port).toBeString()
      expectTypeOf(viewerStore.client).toEqualTypeOf({})
      expectTypeOf(viewerStore.picking_mode).toBeBoolean()
      expectTypeOf(viewerStore.picked_point).toEqualTypeOf({
        x: null,
        y: null,
      })
      expectTypeOf(viewerStore.picked_point).toBeNumber()
      expectTypeOf(viewerStore.status).toBeString()
    })
  })

  describe("getters", () => {
    describe("protocol", () => {
      test("test app_mode CLOUD", () => {
        const infra_store = useInfraStore()
        const viewerStore = useViewerStore()
        infra_store.app_mode = appMode.CLOUD
        expect(viewerStore.protocol).toBe("wss")
      })
      test("test app_mode BROWSER", () => {
        const infra_store = useInfraStore()
        const viewerStore = useViewerStore()
        infra_store.app_mode = appMode.BROWSER
        expect(viewerStore.protocol).toBe("ws")
      })
      test("test app_mode DESKTOP", () => {
        const infra_store = useInfraStore()
        const viewerStore = useViewerStore()
        infra_store.app_mode = appMode.DESKTOP
        expect(viewerStore.protocol).toBe("ws")
      })
    })

    describe("port", () => {
      test("test app_mode CLOUD", () => {
        const infra_store = useInfraStore()
        const viewerStore = useViewerStore()
        infra_store.app_mode = appMode.CLOUD
        expect(viewerStore.port).toBe("443")
      })
      test("test app_mode BROWSER", () => {
        const infra_store = useInfraStore()
        const viewerStore = useViewerStore()
        infra_store.app_mode = appMode.BROWSER
        expect(viewerStore.port).toBe(viewerStore.default_local_port)
      })
      test("test app_mode DESKTOP", () => {
        const infra_store = useInfraStore()
        const viewerStore = useViewerStore()
        infra_store.app_mode = appMode.DESKTOP
        expect(viewerStore.port).toBe(viewerStore.default_local_port)
      })

      test("test override default_local_port", () => {
        const infra_store = useInfraStore()
        const viewerStore = useViewerStore()
        infra_store.app_mode = appMode.DESKTOP
        viewerStore.default_local_port = "8080"
        expect(viewerStore.port).toBe("8080")
      })
    })
    describe("base_url", () => {
      test("test app_mode DESKTOP", () => {
        const infra_store = useInfraStore()
        infra_store.app_mode = appMode.DESKTOP
        infra_store.domain_name = "localhost"
        // expect(viewerStore.base_url).toBe("ws://localhost:1234/ws")
      })

      test("test app_mode CLOUD", () => {
        const infra_store = useInfraStore()
        const viewerStore = useViewerStore()
        infra_store.app_mode = appMode.CLOUD
        infra_store.ID = "123456"
        infra_store.domain_name = "example.com"
        expect(viewerStore.base_url).toBe(
          "wss://example.com:443/123456/viewer/ws",
        )
      })

      test("test app_mode CLOUD, ID empty", () => {
        const infra_store = useInfraStore()
        const viewerStore = useViewerStore()
        infra_store.app_mode = appMode.CLOUD
        infra_store.ID = ""
        infra_store.domain_name = "example.com"
        expect(() => viewerStore.base_url).toThrowError(
          "ID must not be empty in cloud mode",
        )
      })
    })
    describe("is_busy", () => {
      test("test is_busy", () => {
        const viewerStore = useViewerStore()
        viewerStore.request_counter = 1
        expect(viewerStore.is_busy).toBe(true)
      })
      test("test not is_busy", () => {
        const viewerStore = useViewerStore()
        viewerStore.request_counter = 0
        expect(viewerStore.is_busy).toBe(false)
      })
    })
  })
  describe("actions", () => {
    // test("ws_connect", async () => {
    //   const infra_store = useInfraStore()
    //   const viewerStore = useViewerStore()
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
    //   viewerStore.default_local_port = viewer_port
    //   await viewerStore.ws_connect()
    //   expect(viewerStore.status).toBe(Status.CONNECTED)
    // }, 10000)
    describe("toggle_picking_mode", () => {
      test("test true", async () => {
        const viewerStore = useViewerStore()
        await viewerStore.toggle_picking_mode(true)
        expect(viewerStore.picking_mode).toBe(true)
      })
    })

    describe("start_request", () => {
      test("test increment", async () => {
        const viewerStore = useViewerStore()
        await viewerStore.start_request()
        expect(viewerStore.request_counter).toBe(1)
      })
    })

    describe("stop_request", () => {
      test("test decrement", async () => {
        const viewerStore = useViewerStore()
        await viewerStore.stop_request()
        expect(viewerStore.request_counter).toBe(-1)
      })
    })
  })
})
