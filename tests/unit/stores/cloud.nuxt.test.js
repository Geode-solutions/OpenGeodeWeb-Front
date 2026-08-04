// Third party imports
import { beforeEach, describe, expect, expectTypeOf, test, vi } from "vitest";
import { $fetch } from "ofetch";

// Local imports
import { Status } from "@ogw_front/utils/status";
import { setupActivePinia } from "@ogw_tests/utils";
import { useCloudStore } from "@ogw_front/stores/cloud";
import { useFeedbackStore } from "@ogw_front/stores/feedback";

vi.mock(import("ofetch"), () => ({
  $fetch: vi.fn(),
}));


// CONSTANTS
const PROJECT = "project";

function setupConfig() {
  const config = useRuntimeConfig();
  config.public.PROJECT = PROJECT;
}

describe("cloud store", () => {
  beforeEach(() => {
    setupActivePinia();
  });
  describe("state", () => {
    test("initial state", () => {
      const cloudStore = useCloudStore();
      expectTypeOf(cloudStore.status).toBeString();
      expect(cloudStore.status).toBe(Status.NOT_CONNECTED);
    });
  });

  describe("actions", () => {
    describe("launch", () => {
      beforeEach(() => {
        $fetch.mockReset();
      });

      test("successful launch", async () => {
        setupConfig();
        const cloudStore = useCloudStore();
        const feedbackStore = useFeedbackStore();

        $fetch.mockImplementation((route, options) => {
          const data = { url: "test.com" };
          // oxlint-disable-next-line eslint/id-length
          options.onResponse?.({ response: { ok: true, _data: data } });
          return Promise.resolve(data);
        });

        await cloudStore.launch("noreply@example.com");

        expect(cloudStore.status).toBe(Status.CONNECTED);
        expect(feedbackStore.server_error).toBe(false);
      });

      test("failed launch - error response", async () => {
        setupConfig();
        const cloudStore = useCloudStore();
        const feedbackStore = useFeedbackStore();

        const error = createError({ statusCode: 500, statusMessage: "500 Internal Server Error" });

        $fetch.mockImplementation((route, options) => {
          options.onResponseError?.({
            response: { status: 500, name: "Error", description: "500 Internal Server Error" },
          });
          return Promise.reject(error);
        });

        await expect(cloudStore.launch("noreply@example.com")).rejects.toThrow(
          "500 Internal Server Error",
        );

        expect(cloudStore.status).toBe(Status.NOT_CONNECTED);
        expect(feedbackStore.server_error).toBe(true);
      });
    });

    describe("connect", () => {
      test("successful connect", async () => {
        const cloudStore = useCloudStore();
        await cloudStore.connect();
        expect(cloudStore.status).toBe(Status.CONNECTED);
      });
    });
  });
});
