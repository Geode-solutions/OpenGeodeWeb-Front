import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"
import { describe, test, expect, expectTypeOf, beforeEach, vi } from "vitest"
import { registerEndpoint } from "@nuxt/test-utils/runtime"
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
import Status from "@ogw_f/utils/status"

describe("Geode Store", () => {
  const pinia = createTestingPinia({
    stubActions: false,
  })
  setActivePinia(pinia)
  const infra_store = useInfraStore()
  const geode_store = useGeodeStore()
  const feedback_store = useFeedbackStore()

  beforeEach(() => {
    infra_store.$reset()
    geode_store.$reset()
    feedback_store.$reset()
  })

  describe("state", () => {
    test("initial state", () => {
      expectTypeOf(geode_store.default_local_port).toBeString()
      expectTypeOf(geode_store.request_counter).toBeNumber()
      expectTypeOf(geode_store.status).toBeString()
    })
  })

  describe("getters", () => {
    describe("protocol", () => {
      test("test app_mode CLOUD", () => {
        infra_store.app_mode = appMode.appMode.CLOUD
        expect(geode_store.protocol).toBe("https")
      })
      test("test app_mode BROWSER", () => {
        infra_store.app_mode = appMode.appMode.BROWSER
        expect(geode_store.protocol).toBe("http")
      })
      test("test app_mode DESKTOP", () => {
        infra_store.app_mode = appMode.appMode.DESKTOP
        expect(geode_store.protocol).toBe("http")
      })
    })

    describe("port", () => {
      test("test app_mode CLOUD", () => {
        infra_store.app_mode = appMode.appMode.CLOUD
        expect(geode_store.port).toBe("443")
      })
      test("test app_mode BROWSER", () => {
        infra_store.app_mode = appMode.appMode.BROWSER
        expect(geode_store.port).toBe(geode_store.default_local_port)
      })
      test("test app_mode DESKTOP", () => {
        infra_store.app_mode = appMode.appMode.DESKTOP
        expect(geode_store.port).toBe(geode_store.default_local_port)
      })

      test("test override default_local_port", () => {
        infra_store.app_mode = appMode.appMode.DESKTOP
        geode_store.default_local_port = "12"
        expect(geode_store.port).toBe("12")
      })
    })

    describe("base_url", () => {
      test("test app_mode BROWSER", () => {
        infra_store.app_mode = appMode.appMode.BROWSER
        infra_store.domain_name = "localhost"
        expect(geode_store.base_url).toBe("http://localhost:5000")
      })
      test("test app_mode CLOUD", () => {
        infra_store.app_mode = appMode.appMode.CLOUD
        infra_store.ID = "123456"
        infra_store.domain_name = "example.com"
        expect(geode_store.base_url).toBe(
          "https://example.com:443/123456/geode",
        )
      })
      test("test app_mode CLOUD, ID empty", () => {
        infra_store.app_mode = appMode.appMode.CLOUD
        infra_store.ID = ""
        infra_store.domain_name = "example.com"
        expect(() => geode_store.base_url).toThrowError(
          "ID must not be empty in cloud mode",
        )
      })
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
      const getFakeCall = vi.fn()
      registerEndpoint(back_schemas.opengeodeweb_back.ping.$id, getFakeCall)

      test("response", async () => {
        geode_store.base_url = ""
        getFakeCall.mockImplementation(() => ({}))
        await geode_store.do_ping()
        expect(geode_store.status).toBe(Status.CONNECTED)
        expect(feedback_store.server_error).toBe(false)
      })
      test("response_error", async () => {
        geode_store.base_url = ""
        getFakeCall.mockImplementation(() => {
          throw createError({
            status: 500,
          })
        })

        await geode_store.do_ping()
        expect(geode_store.status).toBe(Status.NOT_CONNECTED)
        expect(feedback_store.server_error).toBe(true)
      })
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
