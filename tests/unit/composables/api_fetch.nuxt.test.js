// Third party imports
import { beforeEach, describe, expect, test } from "vitest"
import { registerEndpoint } from "@nuxt/test-utils/runtime"

// Local imports
import { setupActivePinia } from "../../utils"
import { useFeedbackStore } from "@ogw_front/stores/feedback"
import { useGeodeStore } from "@ogw_front/stores/geode"

const FIRST_INDEX = 0

describe("geodeStore.request()", () => {
  setupActivePinia()
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
    expect(() => geodeStore.request(schema, params)).toThrow(
      "data/test must be number",
    )
  })

  test("invalid params", async () => {
    const params = {}
    expect(() => geodeStore.request(schema, params)).toThrow(
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
      method: schema.methods[FIRST_INDEX],
      handler: () => ({ result: "success" }),
    })
    await geodeStore.request(schema, params, callbacks)
    expect(errorCalled).toBeFalsy()
  })
})
