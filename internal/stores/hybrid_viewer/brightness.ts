import { BACKGROUND_GREY_VALUE, RGB_MAX } from "./constants";
import type { HybridViewerStorePublic } from "./vtk_types";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

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

interface RelativeRect {
  relX: number;
  relY: number;
  relW: number;
  relH: number;
}

function mapRect(
  rect: Readonly<Rect>,
  latestImage: Readonly<DrawableImage>,
  canvasRect: Readonly<DOMRect>,
): RelativeRect {
  const scaleX = latestImage.width / canvasRect.width;
  const scaleY = latestImage.height / canvasRect.height;
  return {
    relX: (rect.x - canvasRect.left) * scaleX,
    relY: (rect.y - canvasRect.top) * scaleY,
    relW: rect.width * scaleX,
    relH: rect.height * scaleY,
  };
}

function sampleMinBrightness(
  ctx: CanvasRenderingContext2D,
  image: Readonly<DrawableImage>,
  relRect: Readonly<RelativeRect>,
): number {
  ctx.drawImage(
    image,
    Math.max(0, relRect.relX),
    Math.max(0, relRect.relY),
    Math.min(image.width, relRect.relW),
    Math.min(image.height, relRect.relH),
    0,
    0,
    SAMPLE_SIZE,
    SAMPLE_SIZE,
  );
  const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  let minBrightness = 1;
  for (let i = 0; i < TOTAL_CHANNELS; i += RGBA_CHANNELS) {
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / (3 * RGB_MAX);
    if (brightness < minBrightness) {
      minBrightness = brightness;
    }
  }
  return minBrightness;
}

function computeAverageBrightness(
  rect: Readonly<Rect>,
  options: Readonly<BrightnessOptions>,
): number {
  const { latestImage, offscreenCtx, offscreenCanvas } = options;
  const { genericRenderWindow } = useHybridViewerStore() as unknown as HybridViewerStorePublic;
  if (!latestImage || !offscreenCtx || !offscreenCanvas || !genericRenderWindow.value) {
    return BACKGROUND_GREY_VALUE / RGB_MAX;
  }
  const canvas = genericRenderWindow.value.getApiSpecificRenderWindow().getCanvas();
  if (canvas === undefined || canvas === null) {
    return BACKGROUND_GREY_VALUE / RGB_MAX;
  }
  if (rect.width <= 0 || rect.height <= 0) {
    return BACKGROUND_GREY_VALUE / RGB_MAX;
  }
  const relRect = mapRect(rect, latestImage, canvas.getBoundingClientRect());
  if (relRect.relW <= 0 || relRect.relH <= 0) {
    return BACKGROUND_GREY_VALUE / RGB_MAX;
  }
  offscreenCanvas.width = SAMPLE_SIZE;
  offscreenCanvas.height = SAMPLE_SIZE;
  try {
    return sampleMinBrightness(offscreenCtx, latestImage, relRect);
  } catch {
    return BACKGROUND_GREY_VALUE / RGB_MAX;
  }
}
function useHybridViewerBrightness(): {
  latestImage: Ref<DrawableImage | undefined>;
  getAverageBrightness: (rect: Readonly<Rect>) => number;
} {
  const latestImage = ref<DrawableImage | undefined>(undefined);
  const offscreenCanvas: HTMLCanvasElement | undefined =
    typeof document === "undefined" ? undefined : document.createElement("canvas");
  const offscreenCtx: CanvasRenderingContext2D | undefined = offscreenCanvas
    ? (offscreenCanvas.getContext("2d", {
        willReadFrequently: true,
      }) ?? undefined)
    : undefined;
  function getAverageBrightness(rect: Readonly<Rect>): number {
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
