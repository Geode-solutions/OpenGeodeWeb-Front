import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"
import { describe, test, expect, expectTypeOf, beforeEach } from "vitest"

describe("Viewer Store", () => {
  const pinia = createTestingPinia({
    stubActions: false,
  })
  setActivePinia(pinia)
  const infra_store = use_infra_store()
  const viewer_store = use_viewer_store()

  beforeEach(() => {
    infra_store.$reset()
    viewer_store.$reset()
  })
  describe("state", () => {
    test("initial state", () => {
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
      test("test is_cloud true", () => {
        infra_store.is_cloud = true
        expect(viewer_store.protocol).toBe("wss")
      })

      test("test is_cloud false", () => {
        infra_store.is_cloud = false
        expect(viewer_store.protocol).toBe("ws")
      })
    })

    describe("port", () => {
      test("test is_cloud true", () => {
        infra_store.is_cloud = true
        expect(viewer_store.port).toBe("443")
      })
      test("test is_cloud false", () => {
        infra_store.is_cloud = false
        expect(viewer_store.port).toBe(viewer_store.default_local_port)
      })

      test("test override default_local_port", () => {
        infra_store.is_cloud = false
        viewer_store.default_local_port = "8080"
        expect(viewer_store.port).toBe("8080")
      })
    })
    describe("base_url", () => {
      test("test is_cloud false", () => {
        infra_store.is_cloud = false
        infra_store.domain_name = "localhost"
        expect(viewer_store.base_url).toBe("ws://localhost:1234/ws")
      })

      test("test is_cloud true", () => {
        infra_store.is_cloud = true
        infra_store.ID = "123456"
        infra_store.domain_name = "example.com"
        expect(viewer_store.base_url).toBe(
          "wss://example.com:443/123456/viewer/ws",
        )
      })

      test("test is_cloud true, ID empty", () => {
        infra_store.is_cloud = true
        infra_store.ID = ""
        infra_store.domain_name = "example.com"
        expect(() => viewer_store.base_url).toThrowError(
          "ID must not be empty in cloud mode",
        )
      })
    })
    describe("is_busy", () => {
      test("test is_busy", () => {
        viewer_store.request_counter = 1
        expect(viewer_store.is_busy).toBe(true)
      })
      test("test not is_busy", () => {
        viewer_store.request_counter = 0
        expect(viewer_store.is_busy).toBe(false)
      })
    })
  })
  describe("actions", () => {
    // MISSING TEST ws_connect()
    describe("toggle_picking_mode", () => {
      test("test true", async () => {
        await viewer_store.toggle_picking_mode(true)
        expect(viewer_store.picking_mode).toBe(true)
      })
    })
    describe("start_request", () => {
      test("test increment", async () => {
        await viewer_store.start_request()
        expect(viewer_store.request_counter).toBe(1)
      })
    })
    describe("stop_request", () => {
      test("test decrement", async () => {
        await viewer_store.stop_request()
        expect(viewer_store.request_counter).toBe(-1)
      })
    })
  })
})
