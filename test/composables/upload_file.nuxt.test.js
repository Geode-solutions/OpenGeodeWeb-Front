import { describe, expect, test, beforeEach } from "vitest"
import { registerEndpoint } from "@nuxt/test-utils/runtime"
import { upload_file } from "@/composables/upload_file"
import schemas from "@geode/opengeodeweb-back/schemas.json"
const schema = schemas.opengeodeweb_back.upload_file

describe("upload_file.js", () => {
  const errors_store = use_errors_store()
  beforeEach(async () => {
    await errors_store.$patch({ errors: [] })
  })

  test("Throw error", async () => {
    var file = "toto"

    expect(async () => {
      await upload_file({ route: schema.$id, file })
    }).rejects.toThrowError("file must be a instance of File")
  })

  test("onResponse", async () => {
    registerEndpoint(schema.$id, {
      method: "PUT",
      handler: () => ({ test: "ok" }),
    })
    var file = new File(["fake_file"], "fake_file.txt")
    var response_value
    await upload_file(
      { route: schema.$id, file },
      {
        response_function: (response) => {
          response_value = response._data.test
        },
      },
    )
    expect(errors_store.errors.length).toBe(0)
    expect(response_value).toBe("ok")
  })
})
