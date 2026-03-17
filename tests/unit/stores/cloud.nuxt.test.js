// Third party imports
import { beforeEach, describe, expect, expectTypeOf, test, vi } from "vitest"
import { registerEndpoint } from "@nuxt/test-utils/runtime"

// Local imports
import { Status } from "@ogw_front/utils/status"
import { setupActivePinia } from "@ogw_tests/utils"
import { useCloudStore } from "@ogw_front/stores/cloud"
import { useFeedbackStore } from "@ogw_front/stores/feedback"

// CONSTANTS
const PORT_443 = "443"
const PROJECT = "project"
const STATUS_500 = 500

beforeEach(async () => {
  setupActivePinia()
})

function setupConfig() {
  const config = useRuntimeConfig()
  config.public.PROJECT = PROJECT
}

describe("Cloud Store", () => {
  describe("state", () => {
    test("initial state", () => {
      const cloudStore = useCloudStore()
      expectTypeOf(cloudStore.status).toBeString()
      expect(cloudStore.status).toBe(Status.NOT_CONNECTED)
    })
  })

  describe("getters", () => {
    describe("protocol", () => {
      test("test protocol is always https", () => {
        const cloudStore = useCloudStore()
        expect(cloudStore.protocol).toBe("https")
      })
    })

    describe("port", () => {
      test("test port is always 443", () => {
        const cloudStore = useCloudStore()
        expect(cloudStore.port).toBe(PORT_443)
      })
    })

    describe("base_url", () => {
      test("test base_url construction", () => {
        setupConfig()
        const cloudStore = useCloudStore()
        expect(cloudStore.base_url).toBe(
          `https://localhost:${PORT_443}/${PROJECT}/createbackend`,
        )
      })
    })

    describe("is_busy", () => {
      test("test is_busy is always false", () => {
        const cloudStore = useCloudStore()
        expect(cloudStore.is_busy).toBeFalsy()
      })
    })
  })

  describe("actions", () => {
    describe("launch", () => {
      const postFakeCall = vi.fn()

      test("successful launch", async () => {
        setupConfig()
        const cloudStore = useCloudStore()
        const feedbackStore = useFeedbackStore()

        cloudStore.base_url = "test-base-url"
        registerEndpoint(cloudStore.base_url, {
          method: "POST",
          handler: postFakeCall,
        })

        postFakeCall.mockImplementation(() => ({
          url: "http://test.com",
        }))

        await cloudStore.launch()

        expect(cloudStore.status).toBe(Status.CONNECTED)
        expect(feedbackStore.server_error).toBeFalsy()
      })

      test("failed launch - error response", async () => {
        setupConfig()
        const cloudStore = useCloudStore()
        const feedbackStore = useFeedbackStore()

        registerEndpoint(cloudStore.base_url, {
          method: "POST",
          handler: postFakeCall,
        })

        postFakeCall.mockImplementation(() => {
          throw createError({
            status: STATUS_500,
            statusMessage: "Internal Server Error",
          })
        })

        await expect(cloudStore.launch()).rejects.toThrow(
          "Failed to launch cloud backend",
        )

        expect(cloudStore.status).toBe(Status.NOT_CONNECTED)
        expect(feedbackStore.server_error).toBeTruthy()
      })
    })

    describe("connect", () => {
      test("successful connect", async () => {
        const cloudStore = useCloudStore()
        await cloudStore.connect()
        expect(cloudStore.status).toBe(Status.CONNECTED)
      })
    })
  })
})
