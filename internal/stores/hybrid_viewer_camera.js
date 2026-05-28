import {
  LONG_ANIMATION_DURATION,
  SHORT_ANIMATION_DURATION,
  animateCamera,
  computeAnimationDuration,
} from "@ogw_internal/stores/hybrid_viewer_camera_animation";
import { dot } from "@kitware/vtk.js/Common/Core/Math";

const BUMP_MULTIPLIER = 0.2;
const ALIGNMENT_THRESHOLD = 0.9;
const EASE_EXPONENT = 1.1;

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

function performSetCamera(targetCameraOptions, options) {
  const { genericRenderWindow, is_moving, imageStyle, syncRemoteCamera } = options;
  const camera = genericRenderWindow.getRenderer().getActiveCamera();
  const startState = getCameraOptions(camera);
  const duration = computeAnimationDuration(startState, targetCameraOptions);
  is_moving.value = true;
  if (imageStyle) {
    imageStyle.opacity = 0;
  }
  animateCamera({
    camera,
    startState,
    targetState: targetCameraOptions,
    duration,
    bumpMultiplier: 0,
    easeExponent: EASE_EXPONENT,
    onUpdate: () => genericRenderWindow.getRenderWindow().render(),
    onEnd: () => {
      applyCameraOptions(camera, targetCameraOptions);
      genericRenderWindow.getRenderWindow().render();
      is_moving.value = false;
      syncRemoteCamera();
    },
  });
}

function performCameraOrientation(orientation, options) {
  const { genericRenderWindow, is_moving, imageStyle, syncRemoteCamera } = options;
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
    alignment > ALIGNMENT_THRESHOLD ? LONG_ANIMATION_DURATION : SHORT_ANIMATION_DURATION;
  is_moving.value = true;
  imageStyle.opacity = 0;

  animateCamera({
    camera,
    startState,
    targetState,
    duration,
    bumpMultiplier: BUMP_MULTIPLIER,
    easeExponent: EASE_EXPONENT,
    onUpdate: () => genericRenderWindow.getRenderWindow().render(),
    onEnd: () => {
      is_moving.value = false;
      syncRemoteCamera();
    },
  });
}

async function performFocusCameraOnObject(id, options) {
  const {
    hybridDb,
    viewerStore,
    viewer_schemas,
    genericRenderWindow,
    block_ids = [],
    is_moving,
    imageStyle,
    syncRemoteCamera,
  } = options;

  if (!hybridDb[id]) {
    return;
  }

  let bounds = [];
  if (block_ids.length > 0) {
    const schema = viewer_schemas.opengeodeweb_viewer.model.get_blocks_bounds;
    const params = { id, block_ids };
    bounds = await viewerStore.request({ schema, params });
  } else {
    bounds = hybridDb[id].actor.getBounds();
  }

  const renderer = genericRenderWindow.getRenderer();
  const camera = renderer.getActiveCamera();
  const startOptions = getCameraOptions(camera);
  renderer.resetCamera(bounds);
  const targetOptions = getCameraOptions(camera);
  applyCameraOptions(camera, startOptions);

  performSetCamera(targetOptions, {
    genericRenderWindow,
    is_moving,
    imageStyle,
    syncRemoteCamera,
  });
}

function performSyncRemoteCamera(options) {
  const { genericRenderWindow, viewerStore, viewer_schemas, remoteRender, camera_options } =
    options;
  const camera = genericRenderWindow.getRenderer().getActiveCamera();
  const options_camera = getCameraOptions(camera);
  const schema = viewer_schemas.opengeodeweb_viewer.viewer.update_camera;
  const params = { camera_options: options_camera };
  viewerStore.request(
    {
      schema,
      params,
    },
    {
      response_function: () => {
        remoteRender();
        Object.assign(camera_options, options_camera);
      },
    },
  );
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

export {
  BUMP_MULTIPLIER,
  ALIGNMENT_THRESHOLD,
  EASE_EXPONENT,
  ORIENTATIONS,
  applyCameraOptions,
  applySnapshot,
  centerCameraOnPosition,
  getCameraOptions,
  performCameraOrientation,
  performFocusCameraOnObject,
  performSetCamera,
  performSyncRemoteCamera,
};
