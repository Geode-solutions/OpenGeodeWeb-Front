import { setActivePinia, createPinia } from "pinia"
import { describe, test, expect, beforeEach } from "vitest"

describe("Viewer Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  describe("getters", () => {
    test("base_url", () => {
      const geode_store = use_geode_store()
      const cloud_store = use_cloud_store()
      cloud_store.$patch({ ID: "123456" })
      geode_store.start_request()
      expect(geode_store.request_counter).toBe(1)
    })
    test("is_busy", () => {
      const viewer_store = use_viewer_store()
      viewer_store.start_request()
      expect(viewer_store.is_busy).toBe(true)
    })
  })
  describe("actions", () => {
    // MISSING TEST ws_connect()
    test("start_request", () => {
      const viewer_store = use_viewer_store()
      viewer_store.start_request()
      expect(viewer_store.request_counter).toBe(1)
      expect(viewer_store.is_busy).toBe(true)
    })

    test("stop_request", () => {
      const viewer_store = use_viewer_store()
      viewer_store.stop_request()
      expect(viewer_store.request_counter).toBe(-1)
      expect(viewer_store.is_busy).toBe(false)
    })
  })
})
