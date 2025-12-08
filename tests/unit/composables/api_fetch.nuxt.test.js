import { describe, expect, test, beforeEach, vi } from "vitest"
import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"
import { registerEndpoint } from "@nuxt/test-utils/runtime"

import { useGeodeStore } from "@ogw_front/stores/geode"
import { useFeedbackStore } from "@ogw_front/stores/feedback"

describe("geodeStore.request()", () => {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })
  setActivePinia(pinia)
  const geodeStore = useGeodeStore()
  const feedbackStore = useFeedbackStore()
  geodeStore.base_url = ""

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
    await feedbackStore.$reset()
    await geodeStore.$reset()
    geodeStore.base_url = ""
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
    expect(() => geodeStore.request(schema, params)).toThrowError(
      "data/test must be number",
    )
  })

  test("invalid params", async () => {
    const params = {}
    expect(() => geodeStore.request(schema, params)).toThrowError(
      "data must have required property 'test'",
    )
  })

  test("request with callbacks", async () => {
    const params = { test: "hello" }
    let errorCalled = false
    const callbacks = {
      request_error_function: async () => {
        errorCalled = true
      },
    }
    registerEndpoint(schema.$id, {
      method: schema.methods[0],
      handler: () => ({ result: "success" }),
    })
    await geodeStore.request(schema, params, callbacks)
    expect(errorCalled).toBe(false)
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
