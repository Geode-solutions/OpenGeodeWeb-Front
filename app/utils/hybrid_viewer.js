const RGB_MAX = 255;
const BACKGROUND_GREY_VALUE = 180;
const SAMPLE_SIZE = 10;
const TOTAL_CHANNELS = 400;
const RGBA_CHANNELS = 4;

function getCameraOptions(camera) {
  if (!camera) {
    return undefined;
  }

  if (typeof camera.getFocalPoint !== "function") {
    return { ...camera };
  }
  return {
    focal_point: [...camera.getFocalPoint()],
    view_up: [...camera.getViewUp()],
    position: [...camera.getPosition()],
    view_angle: camera.getViewAngle(),
    clipping_range: [...camera.getClippingRange()],
    distance: camera.getDistance(),
  };
}

function applyCameraOptions(camera, options) {
  if (!camera || !options) {
    return;
  }
  if (options.focal_point) {
    camera.setFocalPoint(...options.focal_point);
  }
  if (options.view_up) {
    camera.setViewUp(...options.view_up);
  }
  if (options.position) {
    camera.setPosition(...options.position);
  }
  if (options.view_angle) {
    camera.setViewAngle(options.view_angle);
  }
  if (options.clipping_range) {
    camera.setClippingRange(...options.clipping_range);
  }
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

  const { relX, relY, relW, relH } = mapRect(rect, latestImage, canvas.getBoundingClientRect());

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

export { applyCameraOptions, computeAverageBrightness, getCameraOptions };
