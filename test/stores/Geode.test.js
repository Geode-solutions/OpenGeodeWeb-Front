import { setActivePinia, createPinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"
import { use_geode_store } from "@/stores/geode"
import { use_infra_store } from "@/stores/infra"
import { describe, test, expect, beforeEach } from "vitest"
import { registerEndpoint } from "@nuxt/test-utils/runtime"

describe("Geode Store", () => {
  beforeEach(() => {
    use_infra_store().$reset()
    setActivePinia(createTestingPinia())
  })
  describe("state", () => {
    test("initial state when is_cloud is true", async () => {
      const infraStore = use_infra_store()
      infraStore.is_cloud = undefined
      infraStore.is_cloud = true
      const geodeStore = use_geode_store()
      expect(geodeStore.PROTOCOL).toBe("https")
      expect(geodeStore.PORT).toBe("443")
      expect(geodeStore.request_counter).toBe(0)
      expect(geodeStore.is_running).toBe(false)
    })

    test("initial state when is_cloud is false", async () => {
      await use_infra_store().$patch({ is_cloud: false })
      const geodeStore = use_geode_store()
      expect(geodeStore.PROTOCOL).toBe("http")
      expect(geodeStore.PORT).toBe("5000")
      expect(geodeStore.request_counter).toBe(0)
      expect(geodeStore.is_running).toBe(false)
    })

    test("default values for request_counter and is_running", async () => {
      const geodeStore = use_geode_store()
      expect(geodeStore.request_counter).toBe(0)
      expect(geodeStore.is_running).toBe(false)
    })
  })

  describe("getters", () => {
    beforeEach(() => {
      const infraStore = use_infra_store()
      infraStore.domain_name = "example.com"
      infraStore.is_cloud = false
      infraStore.ID = "123456"
    })

    test("test base_url when infra_store is not cloud", () => {
      const geodeStore = use_geode_store()
      expect(geodeStore.base_url).toBe("http://example.com:5000")
    })

    test("test base_url when infra_store is cloud", () => {
      const infraStore = use_infra_store()
      infraStore.is_cloud = true
      const geodeStore = use_geode_store()
      expect(geodeStore.base_url).toBe("https://example.com:443/123456/geode")
    })
  })

  describe("actions", () => {
    beforeEach(() => {

      // setActivePinia(createPinia())
      setActivePinia(createTestingPinia())
      const infraStore = use_infra_store()
      infraStore.api_url = ""
      use_geode_store().$reset()
    })

    test("do_ping", async () => {
      const geode_store = use_geode_store()
      const errors_store = use_errors_store()
      await geode_store.do_ping()

      expect(geode_store.is_running).toBe(false)
      expect(errors_store.server_error).toBe(true)

      console.log("geode_store.base_url", geode_store.base_url)
      registerEndpoint("/ping", {
        method: "POST",
        handler: () => ({}),
      })
      await geode_store.do_ping()
      await new Promise((resolve) => setTimeout(resolve, 1500))
      expect(geode_store.is_running).toBe(true)
    })

    test("start_request", () => {
      const geode_store = use_geode_store()
      geode_store.start_request()
      expect(geode_store.request_counter).toBe(1)
      expect(geode_store.is_busy).toBe(true)
    })

    test("stop_request", () => {
      const geode_store = use_geode_store()
      geode_store.start_request()
      expect(geode_store.request_counter).toBe(1)
      expect(geode_store.is_busy).toBe(true)
      geode_store.stop_request()
      expect(geode_store.request_counter).toBe(0)
      expect(geode_store.is_busy).toBe(false)
    })
  })
})
