// Only ever fires now that tests are .ts; asks every bare `vi.fn()` mock to carry an explicit call-signature type parameter. Real value for a handful of mocks, but for the many plain mock objects across this test suite it would mean guessing a signature that's already implied by how the mock is used (risking a type that quietly doesn't match, which defeats the point) rather than deriving it from each real function - left off rather than doing that at scale.
// oxlint-disable vitest/require-mock-type-parameters
// Third party imports
import { afterAll, beforeAll, beforeEach, describe, expect, expectTypeOf, test, vi } from "vitest";

import { WebSocket } from "ws";
// Local imports
import { appMode } from "@ogw_shared/app_mode";
import { setupActivePinia } from "@ogw_tests/utils";
import { useInfraStore } from "@ogw_front/stores/infra";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Mock navigator.locks API
const mockLockRequest = vi
  .fn()
  .mockImplementation(async (name, handler) => await handler({ name }));

vi.stubGlobal("navigator", {
  ...navigator,
  locks: {
    request: mockLockRequest,
  },
});

describe("viewer store", () => {
  beforeAll(() => {
    globalThis.WebSocket = WebSocket;
  });

  beforeEach(() => {
    setupActivePinia();
  });

  afterAll(() => {
    Reflect.deleteProperty(globalThis, "WebSocket");
  });

  describe("state", () => {
    test("initial state", () => {
      const viewerStore = useViewerStore();
      expectTypeOf(viewerStore.default_local_port).toBeString();
      expect(viewerStore.client).toStrictEqual({});
      expectTypeOf(viewerStore.picking_mode).toBeBoolean();
      expectTypeOf(viewerStore.picked_point).toEqualTypeOf<{
        x: number | undefined;
        y: number | undefined;
        z: number | undefined;
      }>();
      expectTypeOf(viewerStore.picked_point.x).toEqualTypeOf<number | undefined>();
      expectTypeOf(viewerStore.status).toBeString();
    }, 5000);
  });

  describe("getters", () => {
    describe("protocol", () => {
      test("app_mode CLOUD", () => {
        const infraStore = useInfraStore();
        const viewerStore = useViewerStore();
        infraStore.app_mode = appMode.CLOUD;
        expect(viewerStore.protocol).toBe("wss");
      }, 5000);

      test("app_mode BROWSER", () => {
        const infraStore = useInfraStore();
        const viewerStore = useViewerStore();
        infraStore.app_mode = appMode.BROWSER;
        expect(viewerStore.protocol).toBe("ws");
      }, 5000);

      test("app_mode DESKTOP", () => {
        const infraStore = useInfraStore();
        const viewerStore = useViewerStore();
        infraStore.app_mode = appMode.DESKTOP;
        expect(viewerStore.protocol).toBe("ws");
      }, 5000);
    });

    describe("port", () => {
      test("app_mode CLOUD", () => {
        const infraStore = useInfraStore();
        const viewerStore = useViewerStore();
        infraStore.app_mode = appMode.CLOUD;
        expect(viewerStore.port).toBe("443");
      }, 5000);

      test("app_mode BROWSER", () => {
        const infraStore = useInfraStore();
        const viewerStore = useViewerStore();
        infraStore.app_mode = appMode.BROWSER;
        expect(viewerStore.port).toBe(viewerStore.default_local_port);
      }, 5000);

      test("app_mode DESKTOP", () => {
        const infraStore = useInfraStore();
        const viewerStore = useViewerStore();
        infraStore.app_mode = appMode.DESKTOP;
        expect(viewerStore.port).toBe(viewerStore.default_local_port);
      }, 5000);

      test("override default_local_port", () => {
        const infraStore = useInfraStore();
        const viewerStore = useViewerStore();
        infraStore.app_mode = appMode.DESKTOP;
        viewerStore.default_local_port = "8080";
        expect(viewerStore.port).toBe("8080");
      }, 5000);
    });
    describe("base_url", () => {
      test("app_mode DESKTOP", () => {
        const infraStore = useInfraStore();
        const viewerStore = useViewerStore();
        infraStore.app_mode = appMode.DESKTOP;
        infraStore.domain_name = "localhost";
        expect(viewerStore.base_url).toBe("ws://localhost:1234/ws");
      }, 5000);

      test("app_mode CLOUD", () => {
        const infraStore = useInfraStore();
        const viewerStore = useViewerStore();
        infraStore.app_mode = appMode.CLOUD;
        infraStore.domain_name = "example.com";
        expect(viewerStore.base_url).toBe("wss://example.com:443/viewer/ws");
      }, 5000);
    });
    describe("is_busy", () => {
      test("is_busy", () => {
        const viewerStore = useViewerStore();
        viewerStore.request_counter = 1;
        expect(viewerStore.is_busy).toBe(true);
      }, 5000);

      test("not is_busy", () => {
        const viewerStore = useViewerStore();
        viewerStore.request_counter = 0;
        expect(viewerStore.is_busy).toBe(false);
      }, 5000);
    });
  });
  describe("actions", () => {
    describe("toggle_picking_mode", () => {
      test("true", async () => {
        const viewerStore = useViewerStore();
        await viewerStore.toggle_picking_mode(true);
        expect(viewerStore.picking_mode).toBe(true);
      }, 5000);
    });

    describe("start_request", () => {
      test("increment", async () => {
        const viewerStore = useViewerStore();
        await viewerStore.start_request();
        expect(viewerStore.request_counter).toBe(1);
      }, 5000);
    });

    describe("stop_request", () => {
      test("decrement", async () => {
        const viewerStore = useViewerStore();
        await viewerStore.stop_request();
        expect(viewerStore.request_counter).toBe(-1);
      }, 5000);
    });
  });
});
