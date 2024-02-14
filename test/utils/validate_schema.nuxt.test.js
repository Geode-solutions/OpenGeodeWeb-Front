import { describe, expect, test } from "vitest"

describe("validate_schema.js", () => {
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

  test("Ajv wrong params", async () => {
    params = {}
    var { valid, error } = validate_schema(schema, params, [
      "methods",
      "route",
      "max_retry",
    ])
    expect(valid).toBe(false)
    expect(error).toBe("data must have required property 'test'")
  })

  test("Good params", async () => {
    params = { test: "test" }
    var { valid, error } = validate_schema(schema, params, [
      "methods",
      "route",
      "max_retry",
    ])
    expect(valid).toBe(true)
    expect(error).toBe("No errors")
  })
})
