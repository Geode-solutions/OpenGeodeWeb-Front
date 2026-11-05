// Only ever fires now that tests are .ts; asks every bare `vi.fn()` mock to carry an explicit call-signature type parameter. Real value for a handful of mocks, but for the many plain mock objects across this test suite it would mean guessing a signature that's already implied by how the mock is used (risking a type that quietly doesn't match, which defeats the point) rather than deriving it from each real function - left off rather than doing that at scale.
// oxlint-disable vitest/require-mock-type-parameters
// Third party imports
import { beforeEach, describe, expect, test, vi } from "vitest";
import { $fetch } from "ofetch";

// Local imports
import {
  CLOUD_RUN_HOST,
  RESPONSE_ERROR_STATUS,
  RESPONSE_OK_STATUS,
  buildFetchContext,
  toHookArray,
} from "@ogw_tests/unit/stores/cloud_helpers";
import { Status } from "@ogw_front/utils/status";
import { appMode } from "@ogw_shared/app_mode";
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

  describe("actions", () => {
    describe("connect_existing", () => {
      beforeEach(() => {
        mockedFetch.mockReset();
        useInfraStore().app_mode = appMode.CLOUD;
      });

      test("successful connect_existing", async () => {
        const cloudStore = useCloudStore();
        const feedbackStore = useFeedbackStore();

        mockedFetch.mockImplementation(async (_route, options) => {
          const data = {};
          const onResponseHooks = toHookArray(options?.onResponse);
          await Promise.all(
            onResponseHooks.map(async (hook) => {
              await hook(buildFetchContext(data, RESPONSE_OK_STATUS));
            }),
          );
          return data;
        });

        await cloudStore.connect_existing(CLOUD_RUN_HOST);

        expect(mockedFetch).toHaveBeenCalledWith(
          "opengeodeweb_back/ping",
          expect.objectContaining({
            baseURL: `https://${CLOUD_RUN_HOST}:443/geode`,
          }),
        );
        expect(mockedFetch).not.toHaveBeenCalledWith("cloud_api/cloud/run", expect.anything());
        expect(cloudStore.status).toBe(Status.CONNECTED);
        expect(feedbackStore.server_error).toBe(false);
        expect(useInfraStore().domain_name).toBe(CLOUD_RUN_HOST);
      });

      test("failed connect_existing - unreachable service", async () => {
        const cloudStore = useCloudStore();
        const feedbackStore = useFeedbackStore();
        const infraStore = useInfraStore();
        const previous_domain_name = infraStore.domain_name;

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

        await expect(cloudStore.connect_existing(CLOUD_RUN_HOST)).rejects.toThrow(
          "500 Internal Server Error",
        );

        expect(cloudStore.status).toBe(Status.NOT_CONNECTED);
        expect(feedbackStore.server_error).toBe(true);
        expect(infraStore.domain_name).toBe(previous_domain_name);
      });
    });
  });
});
