import { describe, expect, test, beforeEach } from "vitest"
import WebsocketConnection from "wslink/src/WebsocketConnection"
import SmartConnect from "wslink/src/SmartConnect"

describe("viewer_call.js", () => {
  const errors_store = use_errors_store()

  const schema = {
    $id: "/test",
    route: "/test",
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
  beforeEach(async () => {
    await errors_store.$patch({ errors: [] })
  })

  test("Ajv wrong params", async () => {
    // expect(errors_store.errors.length).toBe(1)
    // expect(errors_store.errors[0].code).toBe(400)
  })
})
