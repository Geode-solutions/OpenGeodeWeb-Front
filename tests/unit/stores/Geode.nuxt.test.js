// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
import { registerEndpoint } from "@nuxt/test-utils/runtime"
import { describe, expect, expectTypeOf, test, vi } from "vitest"

// Local imports
import { appMode } from "@ogw_front/utils/app_mode"
import { setupActivePinia } from "../../utils"
import Status from "@ogw_front/utils/status"
import { useGeodeStore } from "@ogw_front/stores/geode"
import { useInfraStore } from "@ogw_front/stores/infra"

// CONSTANTS
const PORT_443 = "443"
const PORT_12 = "12"
const PORT_5000 = "5000"
const CLOUD_ID = "123456"
const STATUS_500 = 500
const EXPECTED_ONE_REQUEST = 1
const EXPECTED_NO_REQUEST = 0

beforeEach(() => {
  setupActivePinia()
})

describe("geode store", () => {
  test("state", () => {
    const geodeStore = useGeodeStore()
    expectTypeOf(geodeStore.default_local_port).toBeString()
    expectTypeOf(geodeStore.request_counter).toBeNumber()
    expectTypeOf(geodeStore.status).toBeString()
  })

  describe("protocol", () => {
    test("app_mode CLOUD", () => {
      const infraStore = useInfraStore()
      const geodeStore = useGeodeStore()
      infraStore.app_mode = appMode.CLOUD
      expect(geodeStore.protocol).toBe("https")
    })

    test("app_mode BROWSER/DESKTOP", () => {
      const infraStore = useInfraStore()
      const geodeStore = useGeodeStore()
      infraStore.app_mode = appMode.BROWSER
      expect(geodeStore.protocol).toBe("http")
      infraStore.app_mode = appMode.DESKTOP
      expect(geodeStore.protocol).toBe("http")
    })
  })

  describe("port", () => {
    test("app_mode CLOUD", () => {
      const infraStore = useInfraStore()
      const geodeStore = useGeodeStore()
      infraStore.app_mode = appMode.CLOUD
      expect(geodeStore.port).toBe(PORT_443)
    })

    test("app_mode BROWSER/DESKTOP", () => {
      const infraStore = useInfraStore()
      const geodeStore = useGeodeStore()
      infraStore.app_mode = appMode.BROWSER
      expect(geodeStore.port).toBe(geodeStore.default_local_port)
      infraStore.app_mode = appMode.DESKTOP
      expect(geodeStore.port).toBe(geodeStore.default_local_port)
    })

    test("override default_local_port", () => {
      const infraStore = useInfraStore()
      const geodeStore = useGeodeStore()
      infraStore.app_mode = appMode.DESKTOP
      geodeStore.default_local_port = PORT_12
      expect(geodeStore.port).toBe(PORT_12)
    })
  })

  describe("base_url", () => {
    test("app_mode BROWSER", () => {
      const infraStore = useInfraStore()
      const geodeStore = useGeodeStore()
      infraStore.app_mode = appMode.BROWSER
      infraStore.domain_name = "localhost"
      expect(geodeStore.base_url).toBe(`http://localhost:${PORT_5000}`)
    })

    test("app_mode CLOUD", () => {
      const infraStore = useInfraStore()
      const geodeStore = useGeodeStore()
      infraStore.app_mode = appMode.CLOUD
      infraStore.ID = CLOUD_ID
      infraStore.domain_name = "example.com"
      expect(geodeStore.base_url).toBe(
        `https://example.com:${PORT_443}/${CLOUD_ID}/geode`,
      )
    })

    test("app_mode CLOUD, ID empty", () => {
      const infraStore = useInfraStore()
      const geodeStore = useGeodeStore()
      infraStore.app_mode = appMode.CLOUD
      infraStore.ID = ""
      infraStore.domain_name = "example.com"
      expect(() => geodeStore.base_url).toThrow(
        "ID must not be empty in cloud mode",
      )
    })
  })

  describe("is_busy", () => {
    test("is_busy", () => {
      const geodeStore = useGeodeStore()
      geodeStore.request_counter = EXPECTED_ONE_REQUEST
      expect(geodeStore.is_busy).toBeTruthy()
    })

    test("not is_busy", () => {
      const geodeStore = useGeodeStore()
      geodeStore.request_counter = EXPECTED_NO_REQUEST
      expect(geodeStore.is_busy).toBeFalsy()
    })
  })
})

describe("geode store actions", () => {
  const getFakeCall = vi.fn()

  beforeEach(() => {
    registerEndpoint(back_schemas.opengeodeweb_back.ping.$id, getFakeCall)
  })

  describe("ping", () => {
    test("response", async () => {
      const geodeStore = useGeodeStore()
      geodeStore.base_url = ""
      getFakeCall.mockImplementation(() => ({}))
      await geodeStore.ping()
      expect(geodeStore.status).toBe(Status.CONNECTED)
    })

    test("response_error", async () => {
      const geodeStore = useGeodeStore()
      geodeStore.base_url = ""
      getFakeCall.mockImplementation(() => {
        throw createError({ status: STATUS_500 })
      })
      await expect(geodeStore.ping()).rejects.toThrow("500")
      expect(geodeStore.status).toBe(Status.NOT_CONNECTED)
    })
  })

  describe("request counter", () => {
    test("increment/decrement", async () => {
      const geodeStore = useGeodeStore()
      expect(geodeStore.request_counter).toBe(EXPECTED_NO_REQUEST)
      await geodeStore.start_request()
      expect(geodeStore.request_counter).toBe(EXPECTED_ONE_REQUEST)
      await geodeStore.stop_request()
      expect(geodeStore.request_counter).toBe(EXPECTED_NO_REQUEST)
    })
  })
})
