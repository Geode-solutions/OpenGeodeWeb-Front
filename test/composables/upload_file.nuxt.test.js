import { describe, expect, test, beforeEach } from "vitest"
import { registerEndpoint } from "@nuxt/test-utils/runtime"

describe("upload_file.js", () => {
  const route = "/upload_file"
  const errors_store = use_errors_store()
  beforeEach(async () => {
    await errors_store.$patch({ errors: [] })
  })

  test("Throw error", async () => {
    const file = "toto"
    try {
      expect(async () => {
        await upload_file({ route, file })
      }).toThrowError("file must be a instance of File")
    } catch (error) {
      console.error(error)
    }
  })

  test("onResponseError", async () => {
    var file = new FileReader()
    var response_error_value
    await upload_file(
      { route, file },
      {
        response_error_function: () => {
          response_error_value = "error"
        },
      },
    )
    expect(errors_store.errors.length).toBe(1)
    expect(response_error_value).toBe("error")
  })

  test("onResponse", async () => {
    registerEndpoint(route, {
      method: "PUT",
      handler: () => ({ test: "ok" }),
    })
    var file = new FileReader()
    var response_value
    await upload_file(
      { route, file },
      {
        response_function: () => {
          response_value = "ok"
        },
      },
    )
    expect(errors_store.errors.length).toBe(0)
    expect(response_value).toBe("ok")
  })
})
