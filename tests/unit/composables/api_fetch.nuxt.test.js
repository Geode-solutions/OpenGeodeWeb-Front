import { describe, expect, test, beforeEach, vi } from "vitest"
import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"
import { registerEndpoint } from "@nuxt/test-utils/runtime"

describe("api_fetch", () => {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })
  setActivePinia(pinia)
  const geode_store = useGeodeStore()
  const feedback_store = useFeedbackStore()
  geode_store.base_url = ""

  const schema = {
    $id: "/test",
    type: "object",
    methods: ["POST"],
    properties: {
      test: {
        type: "string",
      },
    },
    required: ["test"],
    additionalProperties: false,
  }

  beforeEach(async () => {
    await feedback_store.$reset()
    await geode_store.$reset()
    geode_store.base_url = ""
  })

  // test("valid schema and params", async () => {
  //   const params = { test: "hello" }
  //   const response = await api_fetch({ schema, params })
  //   expect(response).toBeDefined()
  // })

  test("invalid schema", async () => {
    const schema = {
      $id: "/test",
      type: "object",
      methods: ["POST"],
      properties: {
        test: {
          type: "number",
        },
      },
      required: ["test"],
      additionalProperties: false,
    }
    const params = { test: "hello" }
    expect(() => api_fetch({ schema, params })).toThrowError(
      "data/test must be number",
    )
  })

  test("invalid params", async () => {
    const schema = {
      $id: "/test",
      type: "object",
      methods: ["POST"],
      properties: {
        test: {
          type: "string",
        },
      },
      required: ["test"],
      additionalProperties: false,
    }
    const params = {}
    expect(() => api_fetch({ schema, params })).toThrowError(
      "data must have required property 'test'",
    )
  })
  test("request error handling", async () => {
    const schema = {
      $id: "/test",
      type: "object",
      methods: ["POST"],
      properties: {
        test: {
          type: "string",
        },
      },
      required: ["test"],
      additionalProperties: false,
    }
    const params = { test: "hello" }
    async function request_error_function() {
      console.log("request_error_function")
    }
    const spy = vi.fn(request_error_function)
    registerEndpoint(schema.$id, {
      method: schema.methods[0],
      handler: () => ({ return: "toto" }),
    })
    await api_fetch({ schema, params }, { request_error_function })
    // expect(feedback_store.feedbacks.length).toBe(1)
    await request_error_function()
    // expect(spy).toHaveBeenCalledTimes(1)
  })

  // test("response handling", async () => {
  //   const schema = {
  //     $id: "/test",
  //     type: "object",
  //     methods: ["POST"],
  //     properties: {
  //       test: {
  //         type: "string",
  //       },
  //     },
  //     required: ["test"],
  //     additionalProperties: false,
  //   }
  //   const params = { test: "hello" }
  //   // const responseFunction = jest.fn()
  //   const response = await api_fetch({ schema, params }, { response_function })
  //   expect(responseFunction).toHaveBeenCalledTimes(1)
  //   expect(response).toBeDefined()
  // })
})
