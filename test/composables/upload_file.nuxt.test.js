import { describe, expect, test, beforeEach } from "vitest"
import { registerEndpoint } from "@nuxt/test-utils/runtime"

describe("upload_file.js", () => {
  const route = "/upload_file"
  const errors_store = use_errors_store()
  beforeEach(async () => {
    await errors_store.$patch({ errors: [] })
  })

  test("onResponseError", async () => {
    let file = new FileReader()
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
    let file = new FileReader()
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
