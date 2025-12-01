// Global imports

// Third party imports
import { registerEndpoint } from "@nuxt/test-utils/runtime"
import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"
import { beforeEach, describe, expect, expectTypeOf, test, vi } from "vitest"

// Local imports
import Status from "@ogw_front/utils/status.js"

beforeEach(async () => {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })
  setActivePinia(pinia)
})

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
        expect(lambdaStore.port).toBe("443")
      })
    })

    describe("base_url", () => {
      test("test base_url construction", () => {
        const lambdaStore = useLambdaStore()
        useRuntimeConfig().public.API_URL = "api.example.com"
        useRuntimeConfig().public.SITE_BRANCH = "/test"
        useRuntimeConfig().public.PROJECT = "/project"
        expect(lambdaStore.base_url).toBe(
          "https://api.example.com:443/test/project/createbackend",
        )
      })
    })

    describe("is_busy", () => {
      test("test is_busy is always false", () => {
        const lambdaStore = useLambdaStore()
        expect(lambdaStore.is_busy).toBe(false)
      })
    })
  })

  describe("actions", () => {
    describe("launch", () => {
      const postFakeCall = vi.fn()
      
      test("successful launch", async () => {
        const lambdaStore = useLambdaStore()
        const feedbackStore = useFeedbackStore()
        
        useRuntimeConfig().public.API_URL = "api.example.com"
        useRuntimeConfig().public.SITE_BRANCH = "/test"
        useRuntimeConfig().public.PROJECT = "/project"
        
        registerEndpoint(lambdaStore.base_url, {
          method: "POST",
          handler: postFakeCall,
        })
        
        postFakeCall.mockImplementation(() => ({
          ID: "test-id-123456",
        }))
        
        const id = await lambdaStore.launch()
        
        expect(lambdaStore.status).toBe(Status.CONNECTED)
        expect(id).toBe("test-id-123456")
        expect(feedbackStore.server_error).toBe(false)
      })

      test("failed launch - error response", async () => {
        const lambdaStore = useLambdaStore()
        const feedbackStore = useFeedbackStore()
        
        useRuntimeConfig().public.API_URL = "api.example.com"
        useRuntimeConfig().public.SITE_BRANCH = "/test"
        useRuntimeConfig().public.PROJECT = "/project"
        
        registerEndpoint(lambdaStore.base_url, {
          method: "POST",
          handler: postFakeCall,
        })
        
        postFakeCall.mockImplementation(() => {
          throw createError({
            status: 500,
            statusMessage: "Internal Server Error",
          })
        })
        
        await expect(lambdaStore.launch()).rejects.toThrow(
          "Failed to launch lambda backend",
        )
        
        expect(lambdaStore.status).toBe(Status.NOT_CONNECTED)
        expect(feedbackStore.server_error).toBe(true)
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
