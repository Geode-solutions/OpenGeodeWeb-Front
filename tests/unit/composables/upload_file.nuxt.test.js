// Third party imports
import { beforeEach, describe, expect, test } from "vitest"
import { registerEndpoint } from "@nuxt/test-utils/runtime"
import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"

// Local imports
import { setupActivePinia } from "../../utils"
import upload_file from "@ogw_front/utils/upload_file"
import { useFeedbackStore } from "@ogw_front/stores/feedback"
import { useGeodeStore } from "@ogw_front/stores/geode"

const ZERO = 0
const schema = schemas.opengeodeweb_back.upload_file

beforeEach(() => {
  setupActivePinia()
  const geodeStore = useGeodeStore()
  geodeStore.base_url = ""
})

describe("upload_file test", () => {
  test("throw error", async () => {
    const file = "toto"

    await expect(upload_file({ route: schema.$id, file })).rejects.toThrow(
      "file must be a instance of File",
    )
  })

  test("onResponse", async () => {
    const feedbackStore = useFeedbackStore()
    registerEndpoint(schema.$id, {
      method: "PUT",
      handler: () => ({ test: "ok" }),
    })
    const file = new File(["fake_file"], "fake_file.txt")
    let response_value = ""
    await upload_file(
      { route: schema.$id, file },
      {
        response_function: (response) => {
          response_value = response._data.test
        },
      },
    )
    expect(feedbackStore.feedbacks).toHaveLength(ZERO)
    expect(response_value).toBe("ok")
  })
})
