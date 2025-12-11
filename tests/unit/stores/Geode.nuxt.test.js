import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"
import { describe, test, expect, expectTypeOf, beforeEach, vi } from "vitest"
import { registerEndpoint } from "@nuxt/test-utils/runtime"
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
import Status from "@ogw_front/utils/status"
import { appMode } from "@ogw_front/utils/app_mode"
import { useInfraStore } from "@ogw_front/stores/infra"
import { useGeodeStore } from "@ogw_front/stores/geode"

beforeEach(async () => {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })
  setActivePinia(pinia)
})

describe("Geode store", () => {
  describe("state", () => {
    test("initial state", () => {
      const geodeStore = useGeodeStore()
      expectTypeOf(geodeStore.default_local_port).toBeString()
      expectTypeOf(geodeStore.request_counter).toBeNumber()
      expectTypeOf(geodeStore.status).toBeString()
    })
  })

  describe("getters", () => {
    describe("protocol", () => {
      test("test app_mode CLOUD", () => {
        const infraStore = useInfraStore()
        const geodeStore = useGeodeStore()
        infraStore.app_mode = appMode.CLOUD
        expect(geodeStore.protocol).toBe("https")
      })
      test("test app_mode BROWSER", () => {
        const infraStore = useInfraStore()
        const geodeStore = useGeodeStore()
        infraStore.app_mode = appMode.BROWSER
        expect(geodeStore.protocol).toBe("http")
      })
      test("test app_mode DESKTOP", () => {
        const infraStore = useInfraStore()
        const geodeStore = useGeodeStore()
        infraStore.app_mode = appMode.DESKTOP
        expect(geodeStore.protocol).toBe("http")
      })
    })

    describe("port", () => {
      test("test app_mode CLOUD", () => {
        const infraStore = useInfraStore()
        const geodeStore = useGeodeStore()
        infraStore.app_mode = appMode.CLOUD
        expect(geodeStore.port).toBe("443")
      })
      test("test app_mode BROWSER", () => {
        const infraStore = useInfraStore()
        const geodeStore = useGeodeStore()
        infraStore.app_mode = appMode.BROWSER
        expect(geodeStore.port).toBe(geodeStore.default_local_port)
      })
      test("test app_mode DESKTOP", () => {
        const infraStore = useInfraStore()
        const geodeStore = useGeodeStore()
        infraStore.app_mode = appMode.DESKTOP
        expect(geodeStore.port).toBe(geodeStore.default_local_port)
      })

      test("test override default_local_port", () => {
        const infraStore = useInfraStore()
        const geodeStore = useGeodeStore()
        infraStore.app_mode = appMode.DESKTOP
        geodeStore.default_local_port = "12"
        expect(geodeStore.port).toBe("12")
      })
    })

    describe("base_url", () => {
      test("test app_mode BROWSER", () => {
        const infraStore = useInfraStore()
        const geodeStore = useGeodeStore()
        infraStore.app_mode = appMode.BROWSER
        infraStore.domain_name = "localhost"
        expect(geodeStore.base_url).toBe("http://localhost:5000")
      })
      test("test app_mode CLOUD", () => {
        const infraStore = useInfraStore()
        const geodeStore = useGeodeStore()
        infraStore.app_mode = appMode.CLOUD
        infraStore.ID = "123456"
        infraStore.domain_name = "example.com"
        expect(geodeStore.base_url).toBe("https://example.com:443/123456/geode")
      })
      test("test app_mode CLOUD, ID empty", () => {
        const infraStore = useInfraStore()
        const geodeStore = useGeodeStore()
        infraStore.app_mode = appMode.CLOUD
        infraStore.ID = ""
        infraStore.domain_name = "example.com"
        expect(() => geodeStore.base_url).toThrowError(
          "ID must not be empty in cloud mode",
        )
      })
    })

    describe("is_busy", () => {
      test("test is_busy", () => {
        const geodeStore = useGeodeStore()
        geodeStore.request_counter = 1
        expect(geodeStore.is_busy).toBe(true)
      })
      test("test not is_busy", () => {
        const geodeStore = useGeodeStore()
        geodeStore.request_counter = 0
        expect(geodeStore.is_busy).toBe(false)
      })
    })
  })

  describe("actions", () => {
    describe("do_ping", () => {
      const getFakeCall = vi.fn()
      registerEndpoint(back_schemas.opengeodeweb_back.ping.$id, getFakeCall)

      test("response", async () => {
        const geodeStore = useGeodeStore()
        geodeStore.base_url = ""
        getFakeCall.mockImplementation(() => ({}))
        await geodeStore.do_ping()
        expect(geodeStore.status).toBe(Status.CONNECTED)
      })
      test("response_error", async () => {
        const geodeStore = useGeodeStore()
        geodeStore.base_url = ""
        getFakeCall.mockImplementation(() => {
          throw createError({
            status: 500,
          })
        })

        await geodeStore.do_ping()
        expect(geodeStore.status).toBe(Status.NOT_CONNECTED)
      })
    })

    describe("start_request", () => {
      test("test increment", async () => {
        const geodeStore = useGeodeStore()
        expect(geodeStore.request_counter).toBe(0)
        await geodeStore.start_request()
        expect(geodeStore.request_counter).toBe(1)
      })
    })
    describe("stop_request", () => {
      test("test decrement", async () => {
        const geodeStore = useGeodeStore()
        geodeStore.request_counter = 1
        await geodeStore.stop_request()
        expect(geodeStore.request_counter).toBe(0)
      })
    })
  })
})
