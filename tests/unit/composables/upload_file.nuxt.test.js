// Third party imports
import { beforeEach, describe, expect, test } from "vitest";
import { registerEndpoint } from "@nuxt/test-utils/runtime";
import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json";

// Local imports
import { setupActivePinia } from "@ogw_tests/utils";
import { useBackStore } from "@ogw_front/stores/back";
import { useFeedbackStore } from "@ogw_front/stores/feedback";

const ZERO = 0;
const schema = schemas.opengeodeweb_back.upload_file;

describe("upload_file", () => {
  beforeEach(() => {
    setupActivePinia();
    const backStore = useBackStore();
    backStore.base_url = "";
  });

  test("throw error", async () => {
    const backStore = useBackStore();
    const file = "toto";

    await expect(backStore.upload(file)).rejects.toThrow("file must be a instance of File");
  });

  test("onResponse", async () => {
    const feedbackStore = useFeedbackStore();
    const backStore = useBackStore();
    registerEndpoint(schema.$id, {
      method: "PUT",
      handler: () => ({ test: "ok" }),
    });
    const file = new File(["fake_file"], "fake_file.txt");
    let response_value = "";
    await backStore.upload(file, {
      response_function: (response) => {
        response_value = response._data.test;
      },
    });
    expect(feedbackStore.feedbacks).toHaveLength(ZERO);
    expect(response_value).toBe("ok");
  });
});
