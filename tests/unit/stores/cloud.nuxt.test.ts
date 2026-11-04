// Only ever fires now that tests are .ts; asks every bare `vi.fn()` mock to carry an explicit call-signature type parameter. Real value for a handful of mocks, but for the many plain mock objects across this test suite it would mean guessing a signature that's already implied by how the mock is used (risking a type that quietly doesn't match, which defeats the point) rather than deriving it from each real function - left off rather than doing that at scale.
// oxlint-disable vitest/require-mock-type-parameters
// Third party imports
import { beforeEach, describe, expect, expectTypeOf, test, vi } from "vitest";
import { $fetch } from "ofetch";

// Local imports
import {
  BRANCH,
  CLOUD_API_URL,
  PROJECT,
  RESPONSE_ERROR_STATUS,
  RESPONSE_OK_STATUS,
  TOKEN,
  buildFetchContext,
  setupConfig,
  toHookArray,
} from "@ogw_tests/unit/stores/cloud_helpers";
import { Status } from "@ogw_front/utils/status";
import { setupActivePinia } from "@ogw_tests/utils";
import { useCloudStore } from "@ogw_front/stores/cloud";
import { useFeedbackStore } from "@ogw_front/stores/feedback";
import { useInfraStore } from "@ogw_front/stores/infra";

// A hand-built `$Fetch`: a mock function plus the `raw`/`native`/`create` members the real
// `ofetch` export carries, so it satisfies the real type directly (no unsafe cast needed).
vi.mock(import("ofetch"), () => ({
  $fetch: Object.assign(vi.fn(), {
    raw: vi.fn(),
    native: vi.fn(),
    create: vi.fn(),
  }),
}));

const mockedFetch = vi.mocked($fetch);

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
        mockedFetch.mockReset();
      });

      test("successful launch", async () => {
        setupConfig();
        const cloudStore = useCloudStore();
        const feedbackStore = useFeedbackStore();

        mockedFetch.mockImplementation(async (_route, options) => {
          const data = { url: "test.com" };
          const onResponseHooks = toHookArray(options?.onResponse);
          await Promise.all(
            onResponseHooks.map(async (hook) => {
              await hook(buildFetchContext(data, RESPONSE_OK_STATUS));
            }),
          );
          return data;
        });

        await cloudStore.launch(TOKEN);

        expect(mockedFetch).toHaveBeenCalledWith(
          "cloud_api/cloud/run",
          expect.objectContaining({
            baseURL: CLOUD_API_URL,
            body: { project: PROJECT, branch: BRANCH },
            headers: { Authorization: `Bearer ${TOKEN}` },
          }),
        );
        expect(cloudStore.status).toBe(Status.CONNECTED);
        expect(feedbackStore.server_error).toBe(false);
        // Viewer/back stores build their URL from domain_name right after launch resolves.
        expect(useInfraStore().domain_name).toBe("test.com");
      });

      test("failed launch - error response", async () => {
        setupConfig();
        const cloudStore = useCloudStore();
        const feedbackStore = useFeedbackStore();

        const error = createError({
          statusCode: 500,
          statusMessage: "500 Internal Server Error",
        });

        mockedFetch.mockImplementation((_route, options) => {
          const onResponseErrorHooks = toHookArray(options?.onResponseError);
          for (const hook of onResponseErrorHooks) {
            void hook(
              buildFetchContext(
                { name: "Error", description: "500 Internal Server Error" },
                RESPONSE_ERROR_STATUS,
              ),
            );
          }
          throw error;
        });

        await expect(cloudStore.launch(TOKEN)).rejects.toThrow("500 Internal Server Error");

        expect(cloudStore.status).toBe(Status.NOT_CONNECTED);
        expect(feedbackStore.server_error).toBe(true);
      });
    });

    describe("connect", () => {
      test("successful connect", () => {
        const cloudStore = useCloudStore();
        cloudStore.connect();
        expect(cloudStore.status).toBe(Status.CONNECTED);
      });
    });
  });
});
