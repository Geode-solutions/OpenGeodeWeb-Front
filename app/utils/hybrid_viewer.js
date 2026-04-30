import { ALIGNMENT_THRESHOLD, BUMP_MULTIPLIER, EASE_EXPONENT, LONG_ANIMATION_DURATION, SHORT_ANIMATION_DURATION } from "@ogw_front/utils/vtk/constants";
import { dot } from "@kitware/vtk.js/Common/Core/Math";

const RGB_MAX = 255;
const BACKGROUND_GREY_VALUE = 180;
const SAMPLE_SIZE = 10;
const TOTAL_CHANNELS = 400;
const RGBA_CHANNELS = 4;

const ORIENTATIONS = {
  zplus: { position: [0, 0, 1], view_up: [0, 1, 0] },
  zminus: { position: [0, 0, -1], view_up: [0, 1, 0] },
  yplus: { position: [0, 1, 0], view_up: [0, 0, 1] },
  yminus: { position: [0, -1, 0], view_up: [0, 0, 1] },
  xplus: { position: [1, 0, 0], view_up: [0, 0, 1] },
  xminus: { position: [-1, 0, 0], view_up: [0, 0, 1] },
};

function getCameraOptions(camera) {
  if (!camera?.getFocalPoint) { return camera; }
  return {
    focal_point: [...(camera.getFocalPoint() ?? [])],
    view_up: [...(camera.getViewUp() ?? [])],
    position: [...(camera.getPosition() ?? [])],
    view_angle: camera.getViewAngle(),
    clipping_range: [...(camera.getClippingRange() ?? [])],
    distance: camera.getDistance(),
  };
}

function applyCameraOptions(camera, options) {
  if (camera?.set && options) {
    camera.set({
      focalPoint: options.focal_point,
      viewUp: options.view_up,
      position: options.position,
      viewAngle: options.view_angle,
      clippingRange: options.clipping_range,
    });
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
  if (!canvas) { return BACKGROUND_GREY_VALUE / RGB_MAX; }
  const { relX, relY, relW, relH } = mapRect(rect, latestImage, canvas.getBoundingClientRect());
  offscreenCanvas.width = SAMPLE_SIZE;
  offscreenCanvas.height = SAMPLE_SIZE;
  try {
    offscreenCtx.drawImage(latestImage, Math.max(0, relX), Math.max(0, relY), Math.min(latestImage.width, relW), Math.min(latestImage.height, relH), 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
    const { data } = offscreenCtx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
    let minBrightness = 1;
    for (let i = 0; i < TOTAL_CHANNELS; i += RGBA_CHANNELS) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / (3 * RGB_MAX);
      if (brightness < minBrightness) { minBrightness = brightness; }
    }
    return minBrightness;
  } catch { return BACKGROUND_GREY_VALUE / RGB_MAX; }
}

function animateCamera(options) {
  const { camera, startState, targetState, duration, bumpMultiplier, easeExponent, onUpdate, onEnd } = options;
  const startTime = performance.now();
  function animate(currentTime) {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const ease = duration > SHORT_ANIMATION_DURATION ? 1 - (1 - progress) ** easeExponent : progress * (2 - progress);
    const bump = bumpMultiplier * Math.sin(Math.PI * progress);
    camera.set({
      position: startState.position.map((startValue, index) => startValue + (targetState.position[index] - startValue) * ease + bump),
      viewUp: startState.view_up.map((startValue, index) => startValue + (targetState.view_up[index] - startValue) * ease),
      focalPoint: startState.focal_point.map((startValue, index) => startValue + (targetState.focal_point[index] - startValue) * ease),
    });
    onUpdate();
    if (progress < 1) { requestAnimationFrame(animate); } else { onEnd(); }
  }
  requestAnimationFrame(animate);
}

function performCameraOrientation(options) {
  const { orientation, camera, renderer, renderWindow, onStart, onEnd } = options;
  const config = ORIENTATIONS[orientation.toLowerCase()];
  const startState = getCameraOptions(camera);
  applyCameraOptions(camera, { ...config, focal_point: [0, 0, 0] });
  renderer.resetCamera();
  const targetState = getCameraOptions(camera);
  applyCameraOptions(camera, startState);
  const alignment = dot(camera.getDirectionOfProjection(), config.position);
  const duration = alignment > ALIGNMENT_THRESHOLD ? LONG_ANIMATION_DURATION : SHORT_ANIMATION_DURATION;
  onStart();
  animateCamera({ camera, startState, targetState, duration, bumpMultiplier: BUMP_MULTIPLIER, easeExponent: EASE_EXPONENT, onUpdate: () => renderWindow.render(), onEnd });
}

export {
  ORIENTATIONS,
  animateCamera,
  applyCameraOptions,
  computeAverageBrightness,
  getCameraOptions,
  performCameraOrientation,
};
