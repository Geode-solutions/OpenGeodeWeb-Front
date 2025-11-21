import { describe, expect, test, beforeEach, vi } from "vitest"
import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"
import { registerEndpoint } from "@nuxt/test-utils/runtime"
import { upload_file } from "@ogw_front/composables/upload_file"
import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
const schema = schemas.opengeodeweb_back.upload_file

beforeEach(async () => {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })
  setActivePinia(pinia)
})

describe("upload_file.js", () => {
  beforeEach(() => {
    const geode_store = useGeodeStore()
    geode_store.base_url = ""
  })

  test("Throw error", async () => {
    var file = "toto"

    expect(async () => {
      await upload_file({ route: schema.$id, file })
    }).rejects.toThrowError("file must be a instance of File")
  })

  test("onResponse", async () => {
    const feedback_store = useFeedbackStore()
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
