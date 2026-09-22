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

function assertIsTestResponse(value: unknown): asserts value is { test: string } {
  const is_test_response =
    typeof value === "object" &&
    value !== null &&
    "test" in value &&
    typeof value.test === "string";
  if (!is_test_response) {
    throw new Error("Response does not have the expected shape");
  }
}

describe("upload_file", () => {
  beforeEach(() => {
    setupActivePinia();
    const backStore = useBackStore();
    (backStore as { base_url: string }).base_url = "";
  });

  test("throw error", async () => {
    const backStore = useBackStore();
    const file = "toto";

    // Upload requires a real File; this intentionally passes an invalid runtime value to exercise its instanceof File guard, declared with @ts-expect-error instead of an unsafe type assertion.
    // @ts-expect-error intentionally invalid runtime type to test the File guard
    await expect(backStore.upload(file)).rejects.toThrow("file must be an instance of File");
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
      response_function: (response: unknown) => {
        assertIsTestResponse(response);
        response_value = response.test;
      },
    });
    expect(feedbackStore.feedbacks).toHaveLength(ZERO);
    expect(response_value).toBe("ok");
  });
});
