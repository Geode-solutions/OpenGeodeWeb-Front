// Global imports
import { describe, expect, expectTypeOf, test, vi } from "vitest"
import { createTestingPinia } from "@pinia/testing"
import { registerEndpoint } from "@nuxt/test-utils/runtime"
import { setActivePinia } from "pinia"

import { useFeedbackStore } from "@ogw_front/stores/feedback"
import { useLambdaStore } from "@ogw_front/stores/lambda"

// Local imports
import Status from "@ogw_front/utils/status"

// CONSTANTS
const PORT_443 = "443"
const API_URL = "api.example.com"
const SITE_BRANCH = "/test"
const PROJECT = "/project"
const TEST_ID = "test-id-123456"
const STATUS_500 = 500

function setup() {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })
  setActivePinia(pinia)
}

function setupConfig() {
  const config = useRuntimeConfig()
  config.public.API_URL = API_URL
  config.public.SITE_BRANCH = SITE_BRANCH
  config.public.PROJECT = PROJECT
}

describe("lambda store state and config", () => {
  test("initial state", () => {
    setup()
    const lambdaStore = useLambdaStore()
    expectTypeOf(lambdaStore.status).toBeString()
    expect(lambdaStore.status).toBe(Status.NOT_CONNECTED)
  })

  describe("getters", () => {
    test("protocol and port", () => {
      setup()
      const lambdaStore = useLambdaStore()
      expect(lambdaStore.protocol).toBe("https")
      expect(lambdaStore.port).toBe(PORT_443)
    })

    test("base_url construction", () => {
      setup()
      setupConfig()
      const lambdaStore = useLambdaStore()
      expect(lambdaStore.base_url).toBe(
        `https://${API_URL}:${PORT_443}${SITE_BRANCH}${PROJECT}/createbackend`,
      )
    })

    test("is_busy is always false", () => {
      setup()
      const lambdaStore = useLambdaStore()
      expect(lambdaStore.is_busy).toBeFalsy()
    })
  })
})

describe("lambda store actions", () => {
  const postFakeCall = vi.fn()

  describe("launch", () => {
    test("successful launch", async () => {
      setup()
      setupConfig()
      const lambdaStore = useLambdaStore()
      const feedbackStore = useFeedbackStore()

      lambdaStore.base_url = "test-base-url"
      registerEndpoint(lambdaStore.base_url, {
        method: "POST",
        handler: postFakeCall,
      })
      postFakeCall.mockImplementation(() => ({ ID: TEST_ID }))

      const id = await lambdaStore.launch()
      expect(lambdaStore.status).toBe(Status.CONNECTED)
      expect(id).toBe(TEST_ID)
      expect(feedbackStore.server_error).toBeFalsy()
    })

    test("failed launch - error response", async () => {
      setup()
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

  test("successful connect", async () => {
    setup()
    const lambdaStore = useLambdaStore()
    await lambdaStore.connect()
    expect(lambdaStore.status).toBe(Status.CONNECTED)
  })
})
