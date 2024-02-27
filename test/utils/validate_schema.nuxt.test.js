import { describe, expect, test } from "vitest"

describe("validate_schema.js", () => {
  const schema = {
    $id: "/test",
    type: "object",
    methods: ["POST"],
    properties: {
      var_1: {
        type: "string",
      },
      var_2: {
        type: "integer",
        minimum: 0,
        maximum: 10,
      },
    },
    required: ["var_1", "var_2"],
    additionalProperties: false,
  }
  var params

  test("Ajv wrong params", async () => {
    params = {}
    var { valid, error } = validate_schema(schema, params)
    expect(valid).toBe(false)
    expect(error).toBe("data must have required property 'var_1'")
  })

  test("Good params", async () => {
    params = { var_1: "test", var_2: 5 }
    var { valid, error } = validate_schema(schema, params)
    expect(valid).toBe(true)
    expect(error).toBe("No errors")
  })
})
