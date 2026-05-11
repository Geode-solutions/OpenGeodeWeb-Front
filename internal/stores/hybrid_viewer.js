import { dot } from "@kitware/vtk.js/Common/Core/Math";

const RGB_MAX = 255;
const BACKGROUND_GREY_VALUE = 180;
const ACTOR_DARK_VALUE = 20;

const BACKGROUND_COLOR = [
  BACKGROUND_GREY_VALUE / RGB_MAX,
  BACKGROUND_GREY_VALUE / RGB_MAX,
  BACKGROUND_GREY_VALUE / RGB_MAX,
];
const ACTOR_COLOR = [
  ACTOR_DARK_VALUE / RGB_MAX,
  ACTOR_DARK_VALUE / RGB_MAX,
  ACTOR_DARK_VALUE / RGB_MAX,
];
const WHEEL_TIME_OUT_MS = 600;
const BUMP_MULTIPLIER = 0.2;
const ALIGNMENT_THRESHOLD = 0.9;
const LONG_ANIMATION_DURATION = 1000;
const SHORT_ANIMATION_DURATION = 500;
const EASE_EXPONENT = 1.1;

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
  if (!camera?.getFocalPoint) {
    return camera;
  }
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

function centerCameraOnPosition(camera, pickedPosition) {
  if (!camera || !pickedPosition) {
    return;
  }
  const focalPoint = camera.getFocalPoint();
  const position = camera.getPosition();
  camera.setFocalPoint(...pickedPosition);
  camera.setPosition(
    position[0] + pickedPosition[0] - focalPoint[0],
    position[1] + pickedPosition[1] - focalPoint[1],
    position[2] + pickedPosition[2] - focalPoint[2],
  );
}

function performClickPicking(event, options) {
  const { container, viewerStore, viewer_schemas, genericRenderWindow, syncRemoteCamera } = options;
  const rect = container.getBoundingClientRect();
  viewerStore.request(
    viewer_schemas.opengeodeweb_viewer.viewer.get_point_position,
    {
      x: Math.round(event.clientX - rect.left),
      y: Math.round(rect.height - (event.clientY - rect.top)),
    },
    {
      response_function: ({ x, y, z }) => {
        const pickedPos = [x, y, z];
        if (pickedPos.some((val) => val !== 0)) {
          centerCameraOnPosition(genericRenderWindow.getRenderer().getActiveCamera(), pickedPos);
          genericRenderWindow.getRenderWindow().render();
          syncRemoteCamera();
        }
      },
    },
  );
}

function vecSub(vector, other) {
  return [vector[0] - other[0], vector[1] - other[1], vector[2] - other[2]];
}

function vecLength(vector) {
  return Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1] + vector[2] * vector[2]);
}

function vecNormalize(vector) {
  const len = vecLength(vector);
  if (len < 1e-10) {
    return [0, 0, 1];
  }
  return [vector[0] / len, vector[1] / len, vector[2] / len];
}

function slerp(from, to, ratio) {
  const normFrom = vecNormalize(from);
  const normTo = vecNormalize(to);
  let dotProduct = normFrom[0] * normTo[0] + normFrom[1] * normTo[1] + normFrom[2] * normTo[2];
  dotProduct = Math.max(-1, Math.min(1, dotProduct));
  if (dotProduct > 0.9995) {
    return vecNormalize([
      normFrom[0] + (normTo[0] - normFrom[0]) * ratio,
      normFrom[1] + (normTo[1] - normFrom[1]) * ratio,
      normFrom[2] + (normTo[2] - normFrom[2]) * ratio,
    ]);
  }
  const theta = Math.acos(dotProduct);
  const sinTheta = Math.sin(theta);
  const weightFrom = Math.sin((1 - ratio) * theta) / sinTheta;
  const weightTo = Math.sin(ratio * theta) / sinTheta;
  return [
    normFrom[0] * weightFrom + normTo[0] * weightTo,
    normFrom[1] * weightFrom + normTo[1] * weightTo,
    normFrom[2] * weightFrom + normTo[2] * weightTo,
  ];
}

function computeAnimationDuration(startState, targetState) {
  const startDir = vecNormalize(vecSub(startState.position, startState.focal_point));
  const targetDir = vecNormalize(vecSub(targetState.position, targetState.focal_point));
  const dotProduct = Math.max(-1, Math.min(1, dot(startDir, targetDir)));
  const angle = Math.acos(dotProduct);
  const angleRatio = angle / Math.PI;
  return (
    SHORT_ANIMATION_DURATION + (LONG_ANIMATION_DURATION - SHORT_ANIMATION_DURATION) * angleRatio
  );
}

function animateCamera(options) {
  const {
    camera,
    startState,
    targetState,
    duration,
    bumpMultiplier,
    easeExponent,
    onUpdate,
    onEnd,
  } = options;
  const startDir = vecSub(startState.position, startState.focal_point);
  const targetDir = vecSub(targetState.position, targetState.focal_point);
  const startDist = vecLength(startDir);
  const targetDist = vecLength(targetDir);
  const startTime = performance.now();
  function animate(currentTime) {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const ease =
      duration > SHORT_ANIMATION_DURATION
        ? 1 - (1 - progress) ** easeExponent
        : progress * (2 - progress);
    const bump = bumpMultiplier * Math.sin(Math.PI * progress);
    const dir = slerp(startDir, targetDir, ease);
    const dist = startDist + (targetDist - startDist) * ease + bump;
    const focalPoint = startState.focal_point.map(
      (v, i) => v + (targetState.focal_point[i] - v) * ease,
    );
    const viewUp = slerp(startState.view_up, targetState.view_up, ease);
    camera.set({
      position: focalPoint.map((fp, i) => fp + dir[i] * dist),
      viewUp,
      focalPoint,
    });
    onUpdate();
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      onEnd();
    }
  }
  requestAnimationFrame(animate);
}

async function applySnapshot(snapshot, options) {
  const { genericRenderWindow, setZScaling, syncRemoteCamera, setCamera } = options;
  if (!snapshot) {
    return;
  }
  const z_scale = snapshot.zScale;
  if (typeof z_scale === "number") {
    await setZScaling(z_scale);
  }
  const { camera_options: snapshot_camera_options } = snapshot;
  if (snapshot_camera_options) {
    if (setCamera) {
      setCamera(snapshot_camera_options);
    } else {
      applyCameraOptions(
        genericRenderWindow.getRenderer().getActiveCamera(),
        snapshot_camera_options,
      );
      genericRenderWindow.getRenderWindow().render();
      syncRemoteCamera();
    }
  }
}

function performCameraOrientation(orientation, options) {
  const { genericRenderWindow, is_moving, imageStyle, syncRemoteCamera, constants } = options;
  const config = ORIENTATIONS[orientation.toLowerCase()];
  const renderer = genericRenderWindow.getRenderer();
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
    alignment > constants.ALIGNMENT_THRESHOLD
      ? constants.LONG_ANIMATION_DURATION
      : constants.SHORT_ANIMATION_DURATION;
  is_moving.value = true;
  imageStyle.opacity = 0;

  animateCamera({
    camera,
    startState,
    targetState,
    duration,
    bumpMultiplier: constants.BUMP_MULTIPLIER,
    easeExponent: constants.EASE_EXPONENT,
    onUpdate: () => genericRenderWindow.getRenderWindow().render(),
    onEnd: () => {
      is_moving.value = false;
      syncRemoteCamera();
    },
  });
}

export {
  BACKGROUND_COLOR,
  ACTOR_COLOR,
  WHEEL_TIME_OUT_MS,
  BUMP_MULTIPLIER,
  ALIGNMENT_THRESHOLD,
  LONG_ANIMATION_DURATION,
  SHORT_ANIMATION_DURATION,
  EASE_EXPONENT,
  ORIENTATIONS,
  animateCamera,
  applyCameraOptions,
  applySnapshot,
  centerCameraOnPosition,
  computeAnimationDuration,
  computeAverageBrightness,
  getCameraOptions,
  performCameraOrientation,
  performClickPicking,
};
