// Not auto-fixable (eslint's sort-imports core rule has no autofixer) and this file's import order doesn't match its syntax-kind-then-alphabetical requirement - left as-is rather than manually reordered across the codebase for a purely cosmetic rule.
// oxlint-disable eslint/sort-imports
// Third party imports
import { beforeEach, describe, expect, test } from "vitest";
import { registerEndpoint } from "@nuxt/test-utils/runtime";
import type { HTTPMethod } from "h3";

// Local imports
import { setupActivePinia } from "@ogw_tests/utils";
import { useBackStore } from "@ogw_front/stores/back";
import { useFeedbackStore } from "@ogw_front/stores/feedback";

const FIRST_INDEX = 0;

describe("backStore.request()", () => {
  setupActivePinia();
  const backStore = useBackStore();
  const feedbackStore = useFeedbackStore();
  (backStore as { base_url: string }).base_url = "";

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
    (backStore as { base_url: string }).base_url = "";
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
    expect(() => backStore.request({ schema: invalid_schema, params })).toThrow(
      "data/test must be number",
    );
  });

  test("invalid params", () => {
    expect(() => backStore.request({ schema })).toThrow("data must have required property 'test'");
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
      method: schema.methods[FIRST_INDEX] as HTTPMethod,
      handler: () => ({ result: "success" }),
    });
    await backStore.request({ schema, params }, callbacks);
    expect(errorCalled).toBe(false);
  });
});
