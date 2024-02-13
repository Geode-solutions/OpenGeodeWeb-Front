import { describe, expect, test, beforeEach } from "vitest"
import { registerEndpoint } from "@nuxt/test-utils/runtime"
import WebSocket from "ws"

describe("viewer_call.js", () => {
  const errors_store = use_errors_store()

  function createWebSocketServer(server) {
    const wss = new WebSocket.Server({ server })

    wss.on("connection", function (webSocket) {
      webSocket.on("message", function (message) {
        webSocket.send(message)
      })
    })
  }

  const schema = {
    $id: "/test",
    route: "test",
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
    registerEndpoint(schema.$id, {
      method: schema.method,
      handler: () => ({ return: "toto" }),
    })

    // expect(errors_store.errors.length).toBe(1)
    // expect(errors_store.errors[0].code).toBe(400)
  })
})
