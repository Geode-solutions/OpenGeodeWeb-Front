// Not auto-fixable (eslint's sort-imports core rule has no autofixer) and this file's import order doesn't match its syntax-kind-then-alphabetical requirement - left as-is rather than manually reordered across the codebase for a purely cosmetic rule.
// oxlint-disable eslint/sort-imports
// Third party imports
import { beforeEach, describe, expect, test } from "vitest";
import { registerEndpoint } from "@nuxt/test-utils/runtime";

// Local imports
import { setupActivePinia, toHTTPMethod } from "@ogw_tests/utils";
import { useBackStore } from "@ogw_front/stores/back";

const FIRST_INDEX = 0;
const TIMEOUT = 5000;

describe("backStore.request()", () => {
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

  // A fresh pinia per test: setup stores have no $reset
  beforeEach(() => {
    setupActivePinia();
    (useBackStore() as { base_url: string }).base_url = "";
  });

  test(
    "invalid schema",
    async () => {
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
      await expect(useBackStore().request({ schema: invalid_schema, params })).rejects.toThrow(
        "data/test must be number",
      );
    },
    TIMEOUT,
  );

  test(
    "invalid params",
    async () => {
      await expect(useBackStore().request({ schema })).rejects.toThrow(
        "data must have required property 'test'",
      );
    },
    TIMEOUT,
  );

  test(
    "request with callbacks",
    async () => {
      const params = { test: "hello" };
      let errorCalled = false;
      const callbacks = {
        request_error_function: (): void => {
          errorCalled = true;
        },
      };
      registerEndpoint(schema.$id, {
        method: toHTTPMethod(schema.methods[FIRST_INDEX]),
        handler: () => ({ result: "success" }),
      });
      await useBackStore().request({ schema, params }, callbacks);
      expect(errorCalled).toBe(false);
    },
    TIMEOUT,
  );
});
