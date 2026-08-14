import { BACKGROUND_GREY_VALUE, RGB_MAX } from "./constants";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const RGBA_CHANNELS = 4;
const SAMPLE_SIZE = 10;
const TOTAL_CHANNELS = 400;

function useHybridViewerBrightness() {
  const latestImage = ref(undefined);
  const offscreenCanvas =
    typeof document === "undefined" ? undefined : document.createElement("canvas");
  const offscreenCtx = offscreenCanvas
    ? offscreenCanvas.getContext("2d", { willReadFrequently: true })
    : undefined;

  function getAverageBrightness(rect) {
    const { genericRenderWindow } = useHybridViewerStore();
    return computeAverageBrightness(rect, {
      latestImage: latestImage.value,
      offscreenCtx,
      offscreenCanvas,
      genericRenderWindow: genericRenderWindow.value,
    });
  }

  return {
    latestImage,
    getAverageBrightness,
  };
}

function mapRect(rect, latestImage, canvasRect) {
  const scaleX = latestImage.width / canvasRect.width;
  const scaleY = latestImage.height / canvasRect.height;
  return {
    relX: (rect.x - canvasRect.left) * scaleX,
    relY: (rect.y - canvasRect.top) * scaleY,
    relW: rect.width * scaleX,
    relH: rect.height * scaleY,
  };
}

function computeAverageBrightness(rect, options) {
  const { latestImage, offscreenCtx, offscreenCanvas, genericRenderWindow } = options;
  if (!latestImage || !offscreenCtx || !offscreenCanvas || !genericRenderWindow) {
    return BACKGROUND_GREY_VALUE / RGB_MAX;
  }
  const canvas = genericRenderWindow.getApiSpecificRenderWindow().getCanvas();
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
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / (3 * RGB_MAX);
      if (brightness < minBrightness) {
        minBrightness = brightness;
      }
    }
    return minBrightness;
  } catch {
    return BACKGROUND_GREY_VALUE / RGB_MAX;
  }
}

export { computeAverageBrightness, useHybridViewerBrightness };
