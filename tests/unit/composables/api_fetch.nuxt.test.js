// Third party imports
import { beforeEach, describe, expect, test } from "vitest";
import { registerEndpoint } from "@nuxt/test-utils/runtime";

// Local imports
import { setupActivePinia } from "@ogw_tests/utils";
import { useBackStore } from "@ogw_front/stores/back";
import { useFeedbackStore } from "@ogw_front/stores/feedback";

const FIRST_INDEX = 0;

describe("backStore.request()", () => {
  setupActivePinia();
  const backStore = useBackStore();
  const feedbackStore = useFeedbackStore();
  backStore.base_url = "";

  const schema = {
    $id: "/test",
    type: "object",
    methods: ["POST"],
    properties: {
      test: {
        type: "string",
      },
    },
    required: ["test"],
    additionalProperties: false,
  };

  beforeEach(async () => {
    await feedbackStore.$reset();
    await backStore.$reset();
    backStore.base_url = "";
  });

  test("invalid schema", () => {
    const invalid_schema = {
      $id: "/test",
      type: "object",
      methods: ["POST"],
      properties: {
        test: {
          type: "number",
        },
      },
      required: ["test"],
      additionalProperties: false,
    };
    const params = { test: "hello" };
    expect(() => backStore.request(invalid_schema, params)).toThrow("data/test must be number");
  });

  test("invalid params", () => {
    const params = {};
    expect(() => backStore.request(schema, params)).toThrow(
      "data must have required property 'test'",
    );
  });

  test("request with callbacks", async () => {
    const params = { test: "hello" };
    let errorCalled = false;
    const callbacks = {
      request_error_function: () => {
        errorCalled = true;
      },
    };
    registerEndpoint(schema.$id, {
      method: schema.methods[FIRST_INDEX],
      handler: () => ({ result: "success" }),
    });
    await backStore.request(schema, params, callbacks);
    expect(errorCalled).toBe(false);
  });
});
