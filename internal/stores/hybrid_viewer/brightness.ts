import type { Coordinate } from "@ogw_front/types/geometry";
import type { Pixels } from "@ogw_front/types/ui";
import { RGB_MAX } from "./constants";
import { getDefaultSceneStyle } from "@ogw_front/utils/default_styles";
import { useHybridViewerCore } from "./core";

const RGBA_CHANNELS = 4;
const SAMPLE_SIZE = 10;
const TOTAL_CHANNELS = 400;

interface Rect {
  x: Coordinate;
  y: Coordinate;
  width: Pixels;
  height: Pixels;
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

function mapRect(rect: Rect, latestImage: DrawableImage, canvasRect: DOMRect): RelativeRect {
  const scaleX = latestImage.width / canvasRect.width;
  const scaleY = latestImage.height / canvasRect.height;
  return {
    relX: (rect.x - canvasRect.left) * scaleX,
    relY: (rect.y - canvasRect.top) * scaleY,
    relW: rect.width * scaleX,
    relH: rect.height * scaleY,
  };
}

// Darkest and brightest pixels under the rect: dark text has to stay readable over the first, light text over
// The second
interface BrightnessRange {
  darkest: number;
  brightest: number;
}

function sampleBrightnessRange(
  ctx: CanvasRenderingContext2D,
  image: DrawableImage,
  relRect: RelativeRect,
): BrightnessRange {
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
  let darkest = 1;
  let brightest = 0;
  for (let i = 0; i < TOTAL_CHANNELS; i += RGBA_CHANNELS) {
    const brightness = ((data[i] ?? 0) + (data[i + 1] ?? 0) + (data[i + 2] ?? 0)) / (3 * RGB_MAX);
    darkest = Math.min(darkest, brightness);
    brightest = Math.max(brightest, brightness);
  }
  return { darkest, brightest };
}

// Brightness of the scene background a reset viewer draws, for as long as no viewer image can be sampled
function defaultBackgroundBrightness(): number {
  const { red, green, blue } = getDefaultSceneStyle().background_color;
  return (red + green + blue) / (3 * RGB_MAX);
}

function defaultBackgroundRange(): BrightnessRange {
  const brightness = defaultBackgroundBrightness();
  return { darkest: brightness, brightest: brightness };
}

function computeBrightnessRange(rect: Rect, options: BrightnessOptions): BrightnessRange {
  const { latestImage, offscreenCtx, offscreenCanvas } = options;
  const { genericRenderWindow } = useHybridViewerCore();
  if (!latestImage || !offscreenCtx || !offscreenCanvas || !genericRenderWindow.value) {
    return defaultBackgroundRange();
  }
  // oxlint-disable-next-line no-unsafe-assignment -- vtk.js has no types for getApiSpecificRenderWindow(); narrowed below.
  const webGLRenderWindow = genericRenderWindow.value.getApiSpecificRenderWindow();
  // oxlint-disable-next-line no-unsafe-type-assertion -- trusted vtk.js OpenGL render window API boundary.
  const apiSpecificRenderWindow = webGLRenderWindow as unknown as {
    getCanvas: () => HTMLCanvasElement | null | undefined;
  };
  const canvas = apiSpecificRenderWindow.getCanvas();
  if (canvas === undefined || canvas === null) {
    return defaultBackgroundRange();
  }
  if (rect.width <= 0 || rect.height <= 0) {
    return defaultBackgroundRange();
  }
  const relRect = mapRect(rect, latestImage, canvas.getBoundingClientRect());
  if (relRect.relW <= 0 || relRect.relH <= 0) {
    return defaultBackgroundRange();
  }
  offscreenCanvas.width = SAMPLE_SIZE;
  offscreenCanvas.height = SAMPLE_SIZE;
  try {
    return sampleBrightnessRange(offscreenCtx, latestImage, relRect);
  } catch {
    return defaultBackgroundRange();
  }
}
function createOffscreenCanvas(): HTMLCanvasElement | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }
  return document.createElement("canvas");
}

function useHybridViewerBrightness(): {
  latestImage: Ref<DrawableImage | undefined>;
  getBrightnessRange: (rect: Rect) => BrightnessRange;
} {
  const latestImage = ref<DrawableImage | undefined>(undefined);
  const offscreenCanvas: HTMLCanvasElement | undefined = createOffscreenCanvas();
  const offscreenCtx: CanvasRenderingContext2D | undefined = offscreenCanvas
    ? (offscreenCanvas.getContext("2d", {
        willReadFrequently: true,
      }) ?? undefined)
    : undefined;
  function getBrightnessRange(rect: Rect): BrightnessRange {
    return computeBrightnessRange(rect, {
      latestImage: latestImage.value,
      offscreenCtx,
      offscreenCanvas,
    });
  }
  return {
    latestImage,
    getBrightnessRange,
  };
}
export {
  type BrightnessRange,
  computeBrightnessRange,
  defaultBackgroundBrightness,
  useHybridViewerBrightness,
};
