// Third party imports
import { describe, expect, test } from "vitest";

// Local imports
import {
  TIMEOUT,
  setupViewerEnvironment,
  stubNavigatorLocks,
} from "@ogw_tests/unit/stores/viewer_helpers";
import { useViewerStore } from "@ogw_front/stores/viewer";

stubNavigatorLocks();

describe("viewer store", () => {
  setupViewerEnvironment();

  describe("getters", () => {
    describe("is_busy", () => {
      test(
        "is_busy",
        () => {
          const viewerStore = useViewerStore();
          viewerStore.request_counter = 1;
          expect(viewerStore.is_busy).toBe(true);
        },
        TIMEOUT,
      );

      test(
        "not is_busy",
        () => {
          const viewerStore = useViewerStore();
          viewerStore.request_counter = 0;
          expect(viewerStore.is_busy).toBe(false);
        },
        TIMEOUT,
      );
    });
  });
  describe("actions", () => {
    describe("toggle_picking_mode", () => {
      test(
        "true",
        () => {
          const viewerStore = useViewerStore();
          viewerStore.toggle_picking_mode(true);
          expect(viewerStore.picking_mode).toBe(true);
        },
        TIMEOUT,
      );
    });

    describe("start_request", () => {
      test(
        "increment",
        () => {
          const viewerStore = useViewerStore();
          viewerStore.start_request();
          expect(viewerStore.request_counter).toBe(1);
        },
        TIMEOUT,
      );
    });

    describe("stop_request", () => {
      test(
        "decrement",
        () => {
          const viewerStore = useViewerStore();
          viewerStore.stop_request();
          expect(viewerStore.request_counter).toBe(-1);
        },
        TIMEOUT,
      );
    });
  });
});
