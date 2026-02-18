// Third party imports
import { describe, expect, test } from "vitest"

// Local imports
import validate_schema from "@ogw_front/utils/validate_schema"

// CONSTANTS
const MIN_0 = 0
const MAX_10 = 10
const VAL_5 = 5

describe("validate schema", () => {
  const schema = {
    $id: "/test",
    type: "object",
    methods: ["POST"],
    properties: {
      var_1: { type: "string" },
      var_2: { type: "integer", minimum: MIN_0, maximum: MAX_10 },
    },
    required: ["var_1", "var_2"],
    additionalProperties: false,
  }

  test("ajv wrong params", () => {
    const params = {}
    const { valid, error } = validate_schema(schema, params)
    expect(valid).toBeFalsy()
    expect(error).toBe("data must have required property 'var_1'")
  })

  test("good params", () => {
    const params = { var_1: "test", var_2: VAL_5 }
    const { valid, error } = validate_schema(schema, params)
    expect(valid).toBeTruthy()
    expect(error).toBe("No errors")
  })
})
