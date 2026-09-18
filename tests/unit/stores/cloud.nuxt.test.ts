// Only ever fires now that tests are .ts; asks every bare `vi.fn()` mock to carry an explicit call-signature type parameter. Real value for a handful of mocks, but for the many plain mock objects across this test suite it would mean guessing a signature that's already implied by how the mock is used (risking a type that quietly doesn't match, which defeats the point) rather than deriving it from each real function - left off rather than doing that at scale.
// oxlint-disable vitest/require-mock-type-parameters
// Third party imports
import { $fetch, type FetchContext, type FetchResponse } from "ofetch";
import { beforeEach, describe, expect, expectTypeOf, test, vi } from "vitest";

// Local imports
import { Status } from "@ogw_front/utils/status";
import { setupActivePinia } from "@ogw_tests/utils";
import { useCloudStore } from "@ogw_front/stores/cloud";
import { useFeedbackStore } from "@ogw_front/stores/feedback";

// A hand-built `$Fetch`: a mock function plus the `raw`/`native`/`create` members the real
// `ofetch` export carries, so it satisfies the real type directly (no unsafe cast needed).
vi.mock(import("ofetch"), () => ({
  $fetch: Object.assign(vi.fn(), { raw: vi.fn(), native: vi.fn(), create: vi.fn() }),
}));

const mockedFetch = vi.mocked($fetch);

// CONSTANTS
const PROJECT = "project";
const RESPONSE_OK_STATUS = 200;
const RESPONSE_ERROR_STATUS = 500;

function setupConfig(): void {
  const config = useRuntimeConfig();
  config.public.PROJECT = PROJECT;
}

// Normalizes ofetch's `MaybeArray<Hook>` option fields (a single hook or an array of hooks)
// Into a plain array, so tests can invoke every registered hook the same way.
function toHookArray<Hook>(hooks: Hook | Hook[] | undefined): Hook[] {
  if (Array.isArray(hooks)) {
    return hooks;
  }
  return hooks === undefined ? [] : [hooks];
}

// Builds a minimal, real `FetchResponse` (a `Response` with an attached `_data`) so
// Hook callbacks receive an object that genuinely satisfies ofetch's response type.
function buildFetchResponse<ResponseData>(
  responseData: ResponseData,
  status: number,
): FetchResponse<ResponseData> {
  const response: FetchResponse<ResponseData> = Response.json(responseData, { status });
  response._data = responseData;
  return response;
}

// Builds a minimal, real `FetchContext` (plus the response) to hand to `onResponse`/
// `onResponseError` hooks, satisfying ofetch's hook signature without any unsafe cast.
function buildFetchContext<ResponseData>(
  responseData: ResponseData,
  status: number,
): FetchContext & { response: FetchResponse<ResponseData> } {
  return {
    request: "test.com",
    options: { headers: new Headers() },
    response: buildFetchResponse(responseData, status),
  };
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

        await cloudStore.launch("noreply@example.com");

        expect(cloudStore.status).toBe(Status.CONNECTED);
        expect(feedbackStore.server_error).toBe(false);
      });

      test("failed launch - error response", async () => {
        setupConfig();
        const cloudStore = useCloudStore();
        const feedbackStore = useFeedbackStore();

        const error = createError({ statusCode: 500, statusMessage: "500 Internal Server Error" });

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

        await expect(cloudStore.launch("noreply@example.com")).rejects.toThrow(
          "500 Internal Server Error",
        );

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
