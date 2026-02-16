import { describe, expect, test, vi } from "vitest"
import { createTestingPinia } from "@pinia/testing"
import { registerEndpoint } from "@nuxt/test-utils/runtime"
import { setActivePinia } from "pinia"

import { useFeedbackStore } from "@ogw_front/stores/feedback"
import { useGeodeStore } from "@ogw_front/stores/geode"

const FIRST_INDEX = 0

describe("geodeStore.request()", () => {
  function setup() {
    const pinia = createTestingPinia({
      stubActions: false,
      createSpy: vi.fn,
    })
    setActivePinia(pinia)
    const geodeStore = useGeodeStore()
    const feedbackStore = useFeedbackStore()
    geodeStore.base_url = ""
    return { geodeStore, feedbackStore }
  }

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

  test("invalid schema", async () => {
    const { geodeStore } = setup()
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
    expect(() => geodeStore.request(schema, params)).toThrow(
      "data/test must be number",
    )
  })

  test("invalid params", async () => {
    const { geodeStore } = setup()
    const params = {}
    expect(() => geodeStore.request(schema, params)).toThrow(
      "data must have required property 'test'",
    )
  })

  test("request with callbacks", async () => {
    const { geodeStore } = setup()
    const params = { test: "hello" }
    let errorCalled = false
    const callbacks = {
      request_error_function: async () => {
        errorCalled = true
      },
    }
    registerEndpoint(schema.$id, {
      method: schema.methods[FIRST_INDEX],
      handler: () => ({ result: "success" }),
    })
    await geodeStore.request(schema, params, callbacks)
    expect(errorCalled).toBeFalsy()
  })
})
