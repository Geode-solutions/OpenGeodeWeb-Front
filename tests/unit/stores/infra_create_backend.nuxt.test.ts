// Only ever fires now that tests are .ts; asks every bare `vi.fn()` mock to carry an explicit call-signature type parameter. Real value for a handful of mocks, but for the many plain mock objects across this test suite it would mean guessing a signature that's already implied by how the mock is used (risking a type that quietly doesn't match, which defeats the point) rather than deriving it from each real function - left off rather than doing that at scale.
// oxlint-disable vitest/require-mock-type-parameters
// Third party imports
import {
  $fetch,
  type FetchOptions,
  type FetchRequest,
  type FetchResponse,
  type ResolvedFetchOptions,
} from "ofetch";
import { beforeEach, describe, expect, test, vi } from "vitest";

// Local imports
import { Status } from "@ogw_front/utils/status";
import { appMode } from "@ogw_shared/app_mode";
import { setupActivePinia } from "@ogw_tests/utils";
import { useBackStore } from "@ogw_front/stores/back";
import { useInfraStore } from "@ogw_front/stores/infra";
import { useViewerStore } from "@ogw_front/stores/viewer";

vi.mock(import("ofetch"), () => ({
  $fetch: Object.assign(vi.fn(), {
    raw: vi.fn(),
    native: vi.fn(),
    create: vi.fn(),
  }),
}));

// Mock navigator.locks API
const mockLockRequest = vi
  .fn()
  .mockImplementation(
    async (name: string, handler: (lock: { name: string }) => unknown) => await handler({ name }),
  );

// A Proxy is used instead of `{ ...navigator }` so navigator's other getters keep their original `this` (cloning a `Navigator` class instance would lose access to its private fields).
vi.stubGlobal(
  "navigator",
  new Proxy(navigator, {
    get(target, property, _receiver): unknown {
      if (property === "locks") {
        return { request: mockLockRequest };
      }
      return Reflect.get(target, property, target) as unknown;
    },
  }),
);

// Resolves a mocked `$fetch` call's `onResponse` hook with a successful response.
// Kept outside the test bodies so no branching logic lives inside `test()` blocks.
async function respondWithSuccess(
  options: FetchOptions | undefined,
  request: FetchRequest,
  data: { url: string },
): Promise<void> {
  const onResponse = options?.onResponse;
  if (typeof onResponse !== "function") {
    return;
  }
  const response: FetchResponse<typeof data> = Object.assign(
    new Response(undefined, { status: 200 }),
    { _data: data },
  );
  const resolvedOptions: ResolvedFetchOptions = { headers: new Headers() };
  await onResponse({ request, options: resolvedOptions, response });
}

describe("infra store", () => {
  beforeEach(() => {
    setupActivePinia();
  });

  describe("create_backend", () => {
    test("with end-point", async () => {
      const infraStore = useInfraStore();
      const backStore = useBackStore();
      const viewerStore = useViewerStore();

      infraStore.app_mode = appMode.CLOUD;
      const url = "test.com";
      vi.mocked($fetch).mockImplementation(async (_route, options) => {
        const data = { url };
        await respondWithSuccess(options, _route, data);
        return data;
      });

      await infraStore.create_backend("token");
      expect(infraStore.status).toBe(Status.CREATED);
      expect(infraStore.domain_name).toBe(url);

      expect(backStore.status).toBe(Status.NOT_CONNECTED);
      expect(viewerStore.status).toBe(Status.NOT_CONNECTED);
    });

    test("cloud start failure resets status", async () => {
      const infraStore = useInfraStore();

      infraStore.app_mode = appMode.CLOUD;
      vi.mocked($fetch).mockRejectedValue(new Error("unreachable"));

      await expect(infraStore.create_backend("token")).rejects.toThrow("unreachable");
      expect(infraStore.status).toBe(Status.NOT_CREATED);
    });
  });
});
