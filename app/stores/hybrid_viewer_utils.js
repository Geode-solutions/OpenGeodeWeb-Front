const RGB_MAX = 255;
const BACKGROUND_GREY_VALUE = 180;

export function getCameraOptions(camera) {
  if (!camera) {
    return undefined;
  }
  // If it's already a plain object (from a snapshot), just return it or clone it
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

export function applyCameraOptions(camera, options) {
  if (!camera || !options) {
    return;
  }
  if (options.focal_point) camera.setFocalPoint(...options.focal_point);
  if (options.view_up) camera.setViewUp(...options.view_up);
  if (options.position) camera.setPosition(...options.position);
  if (options.view_angle) camera.setViewAngle(options.view_angle);
  if (options.clipping_range) {
    camera.setClippingRange(...options.clipping_range);
  }
}

export function computeAverageBrightness(rect, options) {
  const { latestImage, offscreenCtx, offscreenCanvas, genericRenderWindow } =
    options;
  if (!latestImage || !offscreenCtx || !offscreenCanvas || !genericRenderWindow) {
    return BACKGROUND_GREY_VALUE / RGB_MAX;
  }

  const { x, y, width, height } = rect;
  const webGLRenderWindow = genericRenderWindow.getApiSpecificRenderWindow();
  const canvas = webGLRenderWindow.getCanvas();
  if (!canvas) {
    return BACKGROUND_GREY_VALUE / RGB_MAX;
  }

  const canvasRect = canvas.getBoundingClientRect();
  const scaleX = latestImage.width / canvasRect.width;
  const scaleY = latestImage.height / canvasRect.height;

  const relX = (x - canvasRect.left) * scaleX;
  const relY = (y - canvasRect.top) * scaleY;
  const relW = width * scaleX;
  const relH = height * scaleY;

  const SAMPLE_SIZE = 10;
  const PIXEL_SAMPLE_COUNT = 100;
  const RGBA_CHANNELS = 4;
  const TOTAL_SAMPLE_CHANNELS = 400;

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

    let totalBrightness = 0;
    for (let i = 0; i < TOTAL_SAMPLE_CHANNELS; i += RGBA_CHANNELS) {
      totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / (3 * RGB_MAX);
    }

    return totalBrightness / PIXEL_SAMPLE_COUNT;
  } catch {
    return BACKGROUND_GREY_VALUE / RGB_MAX;
  }
}
