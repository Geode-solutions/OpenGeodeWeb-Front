import {
  ALIGNMENT_THRESHOLD,
  BUMP_MULTIPLIER,
  EASE_EXPONENT,
  ORIENTATIONS,
  applyCameraOptions,
  getImageStyle,
} from "./camera_helpers";
import {
  LONG_ANIMATION_DURATION,
  SHORT_ANIMATION_DURATION,
  animateCamera,
  getCameraOptions,
} from "./camera_animation";
import { requireRenderWindow, useHybridViewerCore } from "./core";
import { dot } from "@kitware/vtk.js/Common/Core/Math";

function animateCameraOrientation(orientation: string, syncRemoteCamera: () => void): void {
  const config = ORIENTATIONS[orientation.toLowerCase()];
  if (!config) {
    return;
  }
  const { genericRenderWindow, is_moving } = useHybridViewerCore();
  const imageStyle = getImageStyle();
  const renderer = requireRenderWindow(genericRenderWindow).getRenderer();
  const camera = renderer.getActiveCamera();
  const startState = getCameraOptions(camera);
  applyCameraOptions(camera, {
    ...config,
    focal_point: [0, 0, 0],
  });
  renderer.resetCamera();
  const targetState = getCameraOptions(camera);
  applyCameraOptions(camera, startState);
  const alignment = dot(camera.getDirectionOfProjection(), config.position);
  const duration =
    alignment > ALIGNMENT_THRESHOLD ? LONG_ANIMATION_DURATION : SHORT_ANIMATION_DURATION;
  is_moving.value = true;
  if (imageStyle) {
    imageStyle.opacity = "0";
  }
  animateCamera({
    camera,
    startState,
    targetState,
    duration,
    bumpMultiplier: BUMP_MULTIPLIER,
    easeExponent: EASE_EXPONENT,
    onUpdate: () => {
      const renderWindow = requireRenderWindow(genericRenderWindow).getRenderWindow();
      renderWindow.render();
    },
    onEnd: () => {
      is_moving.value = false;
      syncRemoteCamera();
    },
  });
}

export { animateCameraOrientation };
