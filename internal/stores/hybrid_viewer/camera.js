import {
  LONG_ANIMATION_DURATION,
  SHORT_ANIMATION_DURATION,
  animateCamera,
  computeAnimationDuration,
} from "./camera_animation";
import { dot } from "@kitware/vtk.js/Common/Core/Math";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

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

function getImageStyle(genericRenderWindow) {
  if (!genericRenderWindow) {
    return undefined;
  }
  const webGLRenderWindow = genericRenderWindow.getApiSpecificRenderWindow();
  if (!webGLRenderWindow) {
    return undefined;
  }
  const bgImage = webGLRenderWindow.getReferenceByName("bgImage");
  return bgImage ? bgImage.style : undefined;
}

function useHybridViewerCamera() {
  const hybridViewerStore = useHybridViewerStore();
  const camera_options = reactive({});

  function syncRemoteCamera() {
    performSyncRemoteCamera();
  }

  function setCamera(targetCameraOptions) {
    performSetCamera(targetCameraOptions);
  }

  function resetCamera() {
    const genericRenderWindow = hybridViewerStore.genericRenderWindow.value;
    const renderer = genericRenderWindow.getRenderer();
    renderer.resetCamera();
    const renderWindow = genericRenderWindow.getRenderWindow();
    renderWindow.render();
    syncRemoteCamera();
  }

  async function focusCameraOnObject(id, block_ids = []) {
    await performFocusCameraOnObject(id, block_ids);
  }

  function setCameraOrientation(orientation) {
    performCameraOrientation(orientation);
  }

  return {
    camera_options,
    syncRemoteCamera,
    setCamera,
    resetCamera,
    focusCameraOnObject,
    setCameraOrientation,
  };
}

function getCameraOptions(camera) {
  if (!camera || !camera.getFocalPoint) {
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
  if (camera && camera.set && options) {
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

function performSetCamera(targetCameraOptions) {
  const hybridViewerStore = useHybridViewerStore();
  const genericRenderWindow = hybridViewerStore.genericRenderWindow.value;
  const { is_moving } = hybridViewerStore;
  const imageStyle = getImageStyle(genericRenderWindow);
  const renderer = genericRenderWindow.getRenderer();
  const camera = renderer.getActiveCamera();
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
    onUpdate: () => {
      const renderWindow = genericRenderWindow.getRenderWindow();
      renderWindow.render();
    },
    onEnd: () => {
      applyCameraOptions(camera, targetCameraOptions);
      const renderWindow = genericRenderWindow.getRenderWindow();
      renderWindow.render();
      is_moving.value = false;
      hybridViewerStore.syncRemoteCamera();
    },
  });
}

function performCameraOrientation(orientation) {
  const hybridViewerStore = useHybridViewerStore();
  const genericRenderWindow = hybridViewerStore.genericRenderWindow.value;
  const { is_moving } = hybridViewerStore;
  const imageStyle = getImageStyle(genericRenderWindow);
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
  if (imageStyle) {
    imageStyle.opacity = 0;
  }

  animateCamera({
    camera,
    startState,
    targetState,
    duration,
    bumpMultiplier: BUMP_MULTIPLIER,
    easeExponent: EASE_EXPONENT,
    onUpdate: () => {
      const renderWindow = genericRenderWindow.getRenderWindow();
      renderWindow.render();
    },
    onEnd: () => {
      is_moving.value = false;
      hybridViewerStore.syncRemoteCamera();
    },
  });
}

async function performFocusCameraOnObject(id, block_ids = []) {
  const hybridViewerStore = useHybridViewerStore();
  const genericRenderWindow = hybridViewerStore.genericRenderWindow.value;
  const { hybridDb } = hybridViewerStore;

  if (!hybridDb[id]) {
    return;
  }

  const viewerStore = useViewerStore();
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

  performSetCamera(targetOptions);
}

function performSyncRemoteCamera() {
  const hybridViewerStore = useHybridViewerStore();
  const genericRenderWindow = hybridViewerStore.genericRenderWindow.value;
  const viewerStore = useViewerStore();
  const renderer = genericRenderWindow.getRenderer();
  const camera = renderer.getActiveCamera();
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
        hybridViewerStore.remoteRender();
        if (hybridViewerStore.camera_options) {
          Object.assign(hybridViewerStore.camera_options, options_camera);
        }
      },
    },
  );
}

async function applySnapshot(snapshot) {
  if (!snapshot) {
    return;
  }
  const hybridViewerStore = useHybridViewerStore();
  const z_scale = snapshot.zScale;
  if (typeof z_scale === "number") {
    await hybridViewerStore.setZScaling(z_scale);
  }
  const { camera_options: snapshot_camera_options } = snapshot;
  if (snapshot_camera_options) {
    if (hybridViewerStore.setCamera) {
      hybridViewerStore.setCamera(snapshot_camera_options);
    } else {
      const genericRenderWindow = hybridViewerStore.genericRenderWindow.value;
      const renderer = genericRenderWindow.getRenderer();
      const camera = renderer.getActiveCamera();
      applyCameraOptions(camera, snapshot_camera_options);
      const renderWindow = genericRenderWindow.getRenderWindow();
      renderWindow.render();
      hybridViewerStore.syncRemoteCamera();
    }
  }
}

export {
  ALIGNMENT_THRESHOLD,
  BUMP_MULTIPLIER,
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
  useHybridViewerCamera,
};
