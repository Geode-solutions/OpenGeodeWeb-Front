// Third party imports
import { beforeEach, describe, expect, expectTypeOf, test, vi } from "vitest"
import { registerEndpoint } from "@nuxt/test-utils/runtime"

// Local imports
import Status from "@ogw_front/utils/status"
import { setupActivePinia } from "../../utils"
import { useFeedbackStore } from "@ogw_front/stores/feedback"
import { useLambdaStore } from "@ogw_front/stores/lambda"

// CONSTANTS
const PORT_443 = "443"
const API_URL = "api.example.com"
const SITE_BRANCH = "/test"
const PROJECT = "project"
const TEST_ID = "test-id-123456"
const STATUS_500 = 500

beforeEach(async () => {
  setupActivePinia()
})

function setupConfig() {
  const config = useRuntimeConfig()
  config.public.API_URL = API_URL
  config.public.SITE_BRANCH = SITE_BRANCH
  config.public.PROJECT = PROJECT
}

describe("Lambda Store", () => {
  describe("state", () => {
    test("initial state", () => {
      const lambdaStore = useLambdaStore()
      expectTypeOf(lambdaStore.status).toBeString()
      expect(lambdaStore.status).toBe(Status.NOT_CONNECTED)
    })
  })

  describe("getters", () => {
    describe("protocol", () => {
      test("test protocol is always https", () => {
        const lambdaStore = useLambdaStore()
        expect(lambdaStore.protocol).toBe("https")
      })
    })

    describe("port", () => {
      test("test port is always 443", () => {
        const lambdaStore = useLambdaStore()
        expect(lambdaStore.port).toBe(PORT_443)
      })
    })

    describe("base_url", () => {
      test("test base_url construction", () => {
        setupConfig()
        const lambdaStore = useLambdaStore()
        expect(lambdaStore.base_url).toBe(
          `https://${API_URL}:${PORT_443}${SITE_BRANCH}/${PROJECT}/createbackend`,
        )
      })
    })

    describe("is_busy", () => {
      test("test is_busy is always false", () => {
        const lambdaStore = useLambdaStore()
        expect(lambdaStore.is_busy).toBeFalsy()
      })
    })
  })

  describe("actions", () => {
    describe("launch", () => {
      const postFakeCall = vi.fn()

      test("successful launch", async () => {
        setupConfig()
        const lambdaStore = useLambdaStore()
        const feedbackStore = useFeedbackStore()

        lambdaStore.base_url = "test-base-url"
        registerEndpoint(lambdaStore.base_url, {
          method: "POST",
          handler: postFakeCall,
        })

        postFakeCall.mockImplementation(() => ({
          ID: TEST_ID,
        }))

        const id = await lambdaStore.launch()

        expect(lambdaStore.status).toBe(Status.CONNECTED)
        expect(id).toBe(TEST_ID)
        expect(feedbackStore.server_error).toBeFalsy()
      })

      test("failed launch - error response", async () => {
        setupConfig()
        const lambdaStore = useLambdaStore()
        const feedbackStore = useFeedbackStore()

        registerEndpoint(lambdaStore.base_url, {
          method: "POST",
          handler: postFakeCall,
        })

        postFakeCall.mockImplementation(() => {
          throw createError({
            status: STATUS_500,
            statusMessage: "Internal Server Error",
          })
        })

        await expect(lambdaStore.launch()).rejects.toThrow(
          "Failed to launch lambda backend",
        )

        expect(lambdaStore.status).toBe(Status.NOT_CONNECTED)
        expect(feedbackStore.server_error).toBeTruthy()
      })
    })

    describe("connect", () => {
      test("successful connect", async () => {
        const lambdaStore = useLambdaStore()
        await lambdaStore.connect()
        expect(lambdaStore.status).toBe(Status.CONNECTED)
      })
    })
  })
})
