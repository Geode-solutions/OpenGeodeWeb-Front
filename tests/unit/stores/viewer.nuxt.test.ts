// Third party imports
import { describe, expect, expectTypeOf, test } from "vitest";

// Local imports
import {
  TIMEOUT,
  setupViewerEnvironment,
  stubNavigatorLocks,
} from "@ogw_tests/unit/stores/viewer_helpers";
import { appMode } from "@ogw_shared/app_mode";
import { useInfraStore } from "@ogw_front/stores/infra";
import { useViewerStore } from "@ogw_front/stores/viewer";

const VIEW_WIDTH = 1920;
const VIEW_HEIGHT = 1080;

stubNavigatorLocks();

describe("viewer store", () => {
  setupViewerEnvironment();

  describe("state", () => {
    test(
      "initial state",
      () => {
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
      },
      TIMEOUT,
    );
  });

  describe("actions", () => {
    test(
      "set_view_size",
      () => {
        const viewerStore = useViewerStore();
        expect(viewerStore.view_size).toStrictEqual({ width: 0, height: 0 });
        viewerStore.set_view_size(VIEW_WIDTH, VIEW_HEIGHT);
        expect(viewerStore.view_size).toStrictEqual({ width: VIEW_WIDTH, height: VIEW_HEIGHT });
      },
      TIMEOUT,
    );
  });

  describe("getters", () => {
    describe("protocol", () => {
      test(
        "app_mode CLOUD",
        () => {
          const infraStore = useInfraStore();
          const viewerStore = useViewerStore();
          infraStore.app_mode = appMode.CLOUD;
          expect(viewerStore.protocol).toBe("wss");
        },
        TIMEOUT,
      );

      test(
        "app_mode BROWSER",
        () => {
          const infraStore = useInfraStore();
          const viewerStore = useViewerStore();
          infraStore.app_mode = appMode.BROWSER;
          expect(viewerStore.protocol).toBe("ws");
        },
        TIMEOUT,
      );

      test(
        "app_mode DESKTOP",
        () => {
          const infraStore = useInfraStore();
          const viewerStore = useViewerStore();
          infraStore.app_mode = appMode.DESKTOP;
          expect(viewerStore.protocol).toBe("ws");
        },
        TIMEOUT,
      );
    });

    describe("port", () => {
      test(
        "app_mode CLOUD",
        () => {
          const infraStore = useInfraStore();
          const viewerStore = useViewerStore();
          infraStore.app_mode = appMode.CLOUD;
          expect(viewerStore.port).toBe("443");
        },
        TIMEOUT,
      );

      test(
        "app_mode BROWSER",
        () => {
          const infraStore = useInfraStore();
          const viewerStore = useViewerStore();
          infraStore.app_mode = appMode.BROWSER;
          expect(viewerStore.port).toBe(viewerStore.default_local_port);
        },
        TIMEOUT,
      );

      test(
        "app_mode DESKTOP",
        () => {
          const infraStore = useInfraStore();
          const viewerStore = useViewerStore();
          infraStore.app_mode = appMode.DESKTOP;
          expect(viewerStore.port).toBe(viewerStore.default_local_port);
        },
        TIMEOUT,
      );

      test(
        "override default_local_port",
        () => {
          const infraStore = useInfraStore();
          const viewerStore = useViewerStore();
          infraStore.app_mode = appMode.DESKTOP;
          viewerStore.default_local_port = "8080";
          expect(viewerStore.port).toBe("8080");
        },
        TIMEOUT,
      );
    });
    describe("base_url", () => {
      test(
        "app_mode DESKTOP",
        () => {
          const infraStore = useInfraStore();
          const viewerStore = useViewerStore();
          infraStore.app_mode = appMode.DESKTOP;
          infraStore.domain_name = "localhost";
          expect(viewerStore.base_url).toBe("ws://localhost:1234/ws");
        },
        TIMEOUT,
      );

      test(
        "app_mode CLOUD",
        () => {
          const infraStore = useInfraStore();
          const viewerStore = useViewerStore();
          infraStore.app_mode = appMode.CLOUD;
          infraStore.domain_name = "example.com";
          expect(viewerStore.base_url).toBe("wss://example.com:443/viewer/ws");
        },
        TIMEOUT,
      );
    });
  });
});
