import { describe, expect, test, beforeEach } from "vitest"
import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"
import { registerEndpoint } from "@nuxt/test-utils/runtime"
import { upload_file } from "@ogw_f/composables/upload_file"
import schemas from "@geode/opengeodeweb-back/schemas.json"
const schema = schemas.opengeodeweb_back.upload_file

describe("upload_file.js", () => {
  const pinia = createTestingPinia({
    stubActions: false,
  })
  setActivePinia(pinia)
  const infra_store = use_infra_store()
  const geode_store = use_geode_store()
  const feedback_store = use_feedback_store()

  beforeEach(() => {
    infra_store.$reset()
    geode_store.$reset()
    feedback_store.$reset()
    geode_store.base_url = ""
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
    expect(feedback_store.feedbacks.length).toBe(0)
    expect(response_value).toBe("ok")
  })
})
