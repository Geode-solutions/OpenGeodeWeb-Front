// Not auto-fixable (eslint's sort-imports core rule has no autofixer) and this file's import order doesn't match its syntax-kind-then-alphabetical requirement - left as-is rather than manually reordered across the codebase for a purely cosmetic rule.
// oxlint-disable eslint/sort-imports
import { BACKGROUND_GREY_VALUE, RGB_MAX } from "./constants";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import type { Ref } from "vue";
import type { HybridViewerStorePublic } from "./vtk_types";

const RGBA_CHANNELS = 4;
const SAMPLE_SIZE = 10;
const TOTAL_CHANNELS = 400;

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// The decoded background image handed to us by the viewer's image stream (see app/stores/hybrid_viewer.ts's onImageReady) - draw-able onto a 2D canvas.
type DrawableImage = CanvasImageSource & { width: number; height: number };

interface BrightnessOptions {
  latestImage: DrawableImage | undefined;
  offscreenCtx: CanvasRenderingContext2D | undefined;
  offscreenCanvas: HTMLCanvasElement | undefined;
}

function mapRect(rect: Rect, latestImage: DrawableImage, canvasRect: DOMRect) {
  const scaleX = latestImage.width / canvasRect.width;
  const scaleY = latestImage.height / canvasRect.height;
  return {
    relX: (rect.x - canvasRect.left) * scaleX,
    relY: (rect.y - canvasRect.top) * scaleY,
    relW: rect.width * scaleX,
    relH: rect.height * scaleY,
  };
}
function computeAverageBrightness(rect: Rect, options: BrightnessOptions): number {
  const { latestImage, offscreenCtx, offscreenCanvas } = options;
  const { genericRenderWindow } = useHybridViewerStore() as unknown as HybridViewerStorePublic;
  if (!latestImage || !offscreenCtx || !offscreenCanvas || !genericRenderWindow.value) {
    return BACKGROUND_GREY_VALUE / RGB_MAX;
  }
  const canvas = genericRenderWindow.value.getApiSpecificRenderWindow().getCanvas();
  if (!canvas) {
    return BACKGROUND_GREY_VALUE / RGB_MAX;
  }
  if (rect.width <= 0 || rect.height <= 0) {
    return BACKGROUND_GREY_VALUE / RGB_MAX;
  }
  const { relX, relY, relW, relH } = mapRect(rect, latestImage, canvas.getBoundingClientRect());
  if (relW <= 0 || relH <= 0) {
    return BACKGROUND_GREY_VALUE / RGB_MAX;
  }
  offscreenCanvas.width = SAMPLE_SIZE;
  offscreenCanvas.height = SAMPLE_SIZE;
  try {
    offscreenCtx.drawImage(
      latestImage,
      Math.max(0, relX),
      Math.max(0, relY),
      Math.min(latestImage.width, relW),
      Math.min(latestImage.height, relH),
      0,
      0,
      SAMPLE_SIZE,
      SAMPLE_SIZE,
    );
    const { data } = offscreenCtx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
    let minBrightness = 1;
    for (let i = 0; i < TOTAL_CHANNELS; i += RGBA_CHANNELS) {
      const brightness = (data[i]! + data[i + 1]! + data[i + 2]!) / (3 * RGB_MAX);
      if (brightness < minBrightness) {
        minBrightness = brightness;
      }
    }
    return minBrightness;
  } catch {
    return BACKGROUND_GREY_VALUE / RGB_MAX;
  }
}
function useHybridViewerBrightness(): {
  latestImage: Ref<DrawableImage | undefined>;
  getAverageBrightness: (rect: Rect) => number;
} {
  const latestImage = ref<DrawableImage | undefined>(undefined);
  const offscreenCanvas: HTMLCanvasElement | undefined =
    typeof document === "undefined" ? undefined : document.createElement("canvas");
  const offscreenCtx: CanvasRenderingContext2D | undefined = offscreenCanvas
    ? (offscreenCanvas.getContext("2d", {
        willReadFrequently: true,
      }) ?? undefined)
    : undefined;
  function getAverageBrightness(rect: Rect): number {
    return computeAverageBrightness(rect, {
      latestImage: latestImage.value,
      offscreenCtx,
      offscreenCanvas,
    });
  }
  return {
    latestImage,
    getAverageBrightness,
  };
}
export { computeAverageBrightness, useHybridViewerBrightness };
