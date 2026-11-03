// Only ever fires now that tests are .ts; asks every bare `vi.fn()` mock to carry an explicit call-signature type parameter. Real value for a handful of mocks, but for the many plain mock objects across this test suite it would mean guessing a signature that's already implied by how the mock is used (risking a type that quietly doesn't match, which defeats the point) rather than deriving it from each real function - left off rather than doing that at scale.
// oxlint-disable vitest/require-mock-type-parameters
// Third party imports
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { $fetch } from "ofetch";

// Local imports
import {
  CLOUD_RUN_HOST,
  RESPONSE_OK_STATUS,
  TOKEN,
  buildFetchContext,
  setCloudUrlParam,
  setupConfig,
  toHookArray,
} from "@ogw_tests/unit/stores/cloud_helpers";
import { appMode } from "@ogw_shared/app_mode";
import { setupActivePinia } from "@ogw_tests/utils";
import { useCloudStore } from "@ogw_front/stores/cloud";
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
    describe("start", () => {
      beforeEach(() => {
        mockedFetch.mockReset();
        useInfraStore().app_mode = appMode.CLOUD;
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
      });
      afterEach(() => {
        setCloudUrlParam();
      });

      test("without cloud_url launches a new service", async () => {
        setupConfig();
        setCloudUrlParam();
        await useCloudStore().start(TOKEN);

        expect(mockedFetch).toHaveBeenCalledWith("cloud_api/cloud/run", expect.anything());
        expect(useInfraStore().domain_name).toBe("test.com");
      });

      test("without cloud_url nor auth token getter rejects", async () => {
        setupConfig();
        setCloudUrlParam();
        await expect(useCloudStore().start()).rejects.toThrow("requires an authenticated user");

        expect(mockedFetch).not.toHaveBeenCalledWith("cloud_api/cloud/run", expect.anything());
      });

      test("with cloud_url connects to the existing service", async () => {
        setupConfig();
        setCloudUrlParam(CLOUD_RUN_HOST);
        await useCloudStore().start(TOKEN);

        expect(mockedFetch).not.toHaveBeenCalledWith("cloud_api/cloud/run", expect.anything());
        expect(mockedFetch).toHaveBeenCalledWith("opengeodeweb_back/ping", expect.anything());
        expect(useInfraStore().domain_name).toBe(CLOUD_RUN_HOST);
        expect(globalThis.location.search).toBe("");
      });

      test("failed cloud_url is cleared so a retry launches a new service", async () => {
        setupConfig();
        setCloudUrlParam(CLOUD_RUN_HOST);
        const cloudStore = useCloudStore();
        mockedFetch.mockRejectedValueOnce(new Error("unreachable"));

        await expect(cloudStore.start(TOKEN)).rejects.toThrow("unreachable");
        expect(globalThis.location.search).toBe("");

        mockedFetch.mockClear();
        await cloudStore.start(TOKEN);
        expect(mockedFetch).toHaveBeenCalledWith("cloud_api/cloud/run", expect.anything());
        expect(mockedFetch).not.toHaveBeenCalledWith("opengeodeweb_back/ping", expect.anything());
        expect(useInfraStore().domain_name).toBe("test.com");
      });
    });
  });
});
