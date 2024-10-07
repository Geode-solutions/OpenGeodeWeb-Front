import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"
import { describe, test, expect, expectTypeOf, beforeEach, vi } from "vitest"
import { registerEndpoint } from "@nuxt/test-utils/runtime"
import back_schemas from "@geode/opengeodeweb-back/schemas.json"

describe("Geode Store", () => {
  const pinia = createTestingPinia({
    stubActions: false,
  })
  setActivePinia(pinia)
  const infra_store = use_infra_store()
  const geode_store = use_geode_store()
  const feedback_store = use_feedback_store()

  beforeEach(() => {
    infra_store.$reset()
    geode_store.$reset()
    feedback_store.$reset()
  })

  describe("state", () => {
    test("initial state", async () => {
      expectTypeOf(geode_store.default_local_port).toBeString()
      expectTypeOf(geode_store.request_counter).toBeNumber()
      expectTypeOf(geode_store.is_running).toBeBoolean()
    })
  })

  describe("getters", () => {
    describe("protocol", () => {
      test("test is_cloud true", () => {
        infra_store.is_cloud = true
        expect(geode_store.protocol).toBe("https")
      })

      test("test is_cloud false", () => {
        infra_store.is_cloud = false
        expect(geode_store.protocol).toBe("http")
      })
    })

    describe("port", () => {
      test("test is_cloud true", () => {
        infra_store.is_cloud = true
        expect(geode_store.port).toBe("443")
      })
      test("test is_cloud false", () => {
        infra_store.is_cloud = false
        expect(geode_store.port).toBe(geode_store.default_local_port)
      })

      test("test override default_local_port", () => {
        infra_store.is_cloud = false
        geode_store.default_local_port = "8080"
        expect(geode_store.port).toBe("8080")
      })
    })

    describe("base_url", () => {
      // test("test is_cloud false", () => {
      //   infra_store.is_cloud = false
      //   infra_store.domain_name = "localhost"
      //   expect(geode_store.base_url).toBe("http://localhost:5000")
      // })
      // test("test is_cloud true", async () => {
      //   infra_store.is_cloud = true
      //   infra_store.ID = "123456"
      //   infra_store.domain_name = "example.com"
      //   expect(geode_store.base_url).toBe(
      //     "https://example.com:443/123456/geode",
      //   )
      // })
      // test("test is_cloud true, ID empty", async () => {
      //   infra_store.is_cloud = true
      //   infra_store.ID = ""
      //   infra_store.domain_name = "example.com"
      //   expect(() => geode_store.base_url).toThrowError(
      //     "ID must not be empty in cloud mode",
      //   )
      // })
    })

    describe("is_busy", () => {
      test("test is_busy", () => {
        geode_store.request_counter = 1
        expect(geode_store.is_busy).toBe(true)
      })
      test("test not is_busy", () => {
        geode_store.request_counter = 0
        expect(geode_store.is_busy).toBe(false)
      })
    })
  })

  describe("actions", () => {
    describe("do_ping", () => {

      // beforeEach(() => {
      //   infra_store.$reset()
      //   geode_store.$reset()
      //   feedback_store.$reset()
      // })


      geode_store.base_url = ""
      const getFakeCall = vi.fn()
      registerEndpoint(back_schemas.opengeodeweb_back.ping.$id, getFakeCall)

      // test("request_error", async () => {
      //   geode_store.base_url = ""
      //   getFakeCall.mockImplementation(() => {
      //     throw createError({
      //       status: 404,
      //     })
      //   })

      //   await geode_store.do_ping()
      //   expect(geode_store.is_running).toBe(false)
      //   expect(feedback_store.server_error).toBe(true)
      // })

      test("response", async () => {
        geode_store.base_url = ""
        getFakeCall.mockImplementation(() => ({ test: 123 }));
        await geode_store.do_ping()
        expect(geode_store.is_running).toBe(true)
        expect(feedback_store.server_error).toBe(false)
      })
      // test("response_error", async () => {
      //   geode_store.base_url = ""
      //   getFakeCall.mockImplementation(() => {
      //     throw createError({
      //       status: 500,
      //     })
      //   })
      //   await geode_store.do_ping()
      //   expect(geode_store.is_running).toBe(false)
      //   expect(feedback_store.server_error).toBe(true)
      // })
    })

    describe("start_request", () => {
      test("test increment", async () => {
        expect(geode_store.request_counter).toBe(0)
        await geode_store.start_request()
        expect(geode_store.request_counter).toBe(1)
      })
    })
    describe("stop_request", () => {
      test("test decrement", async () => {
        geode_store.request_counter = 1
        await geode_store.stop_request()
        expect(geode_store.request_counter).toBe(0)
      })
    })
  })
})
