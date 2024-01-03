import { describe, expect, test, afterEach } from "vitest"
import { registerEndpoint } from "@nuxt/test-utils/runtime"

describe("api_fetch.js", () => {
  const errors_store = use_errors_store()
  afterEach(async () => {
    await errors_store.$patch({ errors: [] })
  })
  test("Wrong params", async () => {
    const schema = {
      $id: "/test/",
      type: "object",
      method: "POST",
      properties: {
        test: {
          type: "string",
        },
      },
      required: ["test"],
      additionalProperties: false,
    }
    const params = {}
    await api_fetch({ schema, params })
    expect(errors_store.errors.length).toBe(1)
  })

  test("Ajv validation", async () => {
    const schema = {
      $id: "/test",
      type: "object",
      method: "POST",
      properties: {
        test: {
          type: "string",
        },
      },
      required: ["test"],
      additionalProperties: false,
    }
    const params = { test: "test" }
    registerEndpoint("/test", {
      method: schema.method,
      handler: () => ({ test: "toto" }),
    })
    const reponse = await api_fetch({ schema, params })
    expect(errors_store.errors.length).toBe(0)
    expect(reponse._data.test).toBe("toto")
  })
})
