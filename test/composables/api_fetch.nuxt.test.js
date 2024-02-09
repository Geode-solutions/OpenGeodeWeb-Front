import { describe, expect, test, beforeEach } from "vitest"
import { registerEndpoint } from "@nuxt/test-utils/runtime"

describe("api_fetch.js", () => {
  const errors_store = use_errors_store()

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
  var params

  beforeEach(async () => {
    await errors_store.$patch({ errors: [] })
  })

  test("Ajv wrong params", async () => {
    registerEndpoint(schema.$id, {
      method: schema.methods[0],
      handler: () => ({ return: "toto" }),
    })
    params = {}
    try {
      await api_fetch({ schema, params })
    } catch (error) {
      expect(error.message).toBe(
        "/test: data must have required property 'test'",
      )
    }
    expect(errors_store.errors.length).toBe(1)
    expect(errors_store.errors[0].code).toBe(400)
  })

  test("onResponse", async () => {
    var response_value
    for (var i = 0; i < 3; i++) {
      registerEndpoint(schema.$id, {
        method: schema.methods[0],
        handler: () => ({ return: "toto" }),
      })
      params = { test: "test" }
      await api_fetch(
        { schema, params },
        {
          response_function: (response) => {
            response_value = response._data.return
          },
        },
      )
      expect(errors_store.errors.length).toBe(0)
      expect(response_value).toBe("toto")
    }
  })

  test("onResponseError", async () => {
    const schema = {
      $id: "/toto",
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
    params = { test: "test" }
    var response_error_value
    await api_fetch(
      { schema, params },
      {
        response_error_function: () => {
          response_error_value = "error"
        },
      },
    )
    expect(errors_store.errors.length).toBe(1)
    expect(response_error_value).toBe("error")
  })
})
