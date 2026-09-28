// Third party imports
import { type MockInstance, afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import type { Position } from "@vueuse/core";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { nextTick } from "vue";

// Local imports
import ZoomBoxOverlay from "@ogw_front/components/ZoomBoxOverlay.vue";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { vuetify } from "@ogw_tests/utils";

const WIDTH = 200;
const HEIGHT = 100;
const PRIMARY_BUTTON = 1;
const SECONDARY_BUTTON = 2;
const TIMEOUT = 5000;
const OVERLAY = '[data-testid="zoomBoxOverlay"]';
const RECTANGLE = ".zoom-box-rectangle";
const START: Position = { x: 10, y: 10 };
const SQUARE_DRAG: Position = { x: 60, y: 60 };
const TINY_DRAG: Position = { x: 12, y: 12 };

function pointer(type: string, point: Position, buttons = PRIMARY_BUTTON): PointerEvent {
  return new PointerEvent(type, { clientX: point.x, clientY: point.y, buttons, bubbles: true });
}

function getOverlay(): Element {
  const overlay = document.querySelector(OVERLAY);
  if (!overlay) {
    throw new Error("Zoom box overlay is not mounted");
  }
  return overlay;
}

async function mountOverlay(): Promise<MockInstance> {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(
    new DOMRect(0, 0, WIDTH, HEIGHT),
  );
  const zoomToBox = vi.spyOn(useHybridViewerStore(), "zoomToBox").mockResolvedValue();
  await mountSuspended(ZoomBoxOverlay, { attachTo: document.body, global: { plugins: [vuetify] } });
  return zoomToBox;
}

async function drag(target: Position, buttons = PRIMARY_BUTTON): Promise<void> {
  const overlay = getOverlay();
  overlay.dispatchEvent(pointer("pointerdown", START, buttons));
  overlay.dispatchEvent(pointer("pointermove", target, buttons));
  overlay.dispatchEvent(pointer("pointerup", target, 0));
  await nextTick();
}

describe("zoom box overlay", () => {
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, "setPointerCapture", {
      value: (): void => undefined,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  test(
    "zooms on the viewport-shaped dragged box",
    async () => {
      const zoomToBox = await mountOverlay();
      await drag(SQUARE_DRAG);
      expect(zoomToBox).toHaveBeenCalledExactlyOnceWith(
        { start_x: 10, start_y: 10, end_x: 110, end_y: 60 },
        { width: WIDTH, height: HEIGHT },
      );
    },
    TIMEOUT,
  );

  test(
    "shows the rectangle only while dragging",
    async () => {
      await mountOverlay();
      const overlay = getOverlay();
      overlay.dispatchEvent(pointer("pointerdown", START));
      overlay.dispatchEvent(pointer("pointermove", SQUARE_DRAG));
      await nextTick();
      expect(document.querySelector(RECTANGLE)).toHaveProperty("style.width", "100px");

      overlay.dispatchEvent(pointer("pointerup", SQUARE_DRAG, 0));
      await nextTick();
      expect(document.querySelector(RECTANGLE)).toBeNull();
    },
    TIMEOUT,
  );

  test.each([
    ["a simple click", START, PRIMARY_BUTTON],
    ["a drag below the threshold", TINY_DRAG, PRIMARY_BUTTON],
    ["the secondary button", SQUARE_DRAG, SECONDARY_BUTTON],
  ])(
    "does not zoom on %s",
    async (_case, target, buttons) => {
      const zoomToBox = await mountOverlay();
      await drag(target, buttons);
      expect(zoomToBox).not.toHaveBeenCalled();
    },
    TIMEOUT,
  );
});
