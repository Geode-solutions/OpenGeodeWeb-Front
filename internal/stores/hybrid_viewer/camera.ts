// Not auto-fixable (eslint's sort-imports core rule has no autofixer) and this file's import order doesn't match its syntax-kind-then-alphabetical requirement - left as-is rather than manually reordered across the codebase for a purely cosmetic rule.
// oxlint-disable eslint/sort-imports
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
import type { Ref } from "vue";
import type { CameraOptions, HybridViewerStorePublic, Vector3, vtkCamera } from "./vtk_types";

const BUMP_MULTIPLIER = 0.2;
const ALIGNMENT_THRESHOLD = 0.9;
const EASE_EXPONENT = 1.1;

interface OrientationConfig {
  position: Vector3;
  view_up: Vector3;
}

const ORIENTATIONS: Record<string, OrientationConfig> = {
  zplus: {
    position: [0, 0, 1],
    view_up: [0, 1, 0],
  },
  zminus: {
    position: [0, 0, -1],
    view_up: [0, 1, 0],
  },
  yplus: {
    position: [0, 1, 0],
    view_up: [0, 0, 1],
  },
  yminus: {
    position: [0, -1, 0],
    view_up: [0, 0, 1],
  },
  xplus: {
    position: [1, 0, 0],
    view_up: [0, 0, 1],
  },
  xminus: {
    position: [-1, 0, 0],
    view_up: [0, 0, 1],
  },
};

// `genericRenderWindow.value` and its vtk objects are only ever read from these functions after the viewer has been initialized (see app/stores/hybrid_viewer.ts's initHybridViewer), so the non-null assertions below reflect that existing invariant rather than a new assumption.

function getImageStyle(): unknown {
  const { genericRenderWindow } = useHybridViewerStore() as unknown as HybridViewerStorePublic;
  if (!genericRenderWindow.value) {
    return undefined;
  }
  const webGLRenderWindow = genericRenderWindow.value.getApiSpecificRenderWindow();
  if (!webGLRenderWindow) {
    return undefined;
  }
  const bgImage = webGLRenderWindow.getReferenceByName("bgImage");
  return bgImage ? bgImage.style : undefined;
}

function getCameraOptions(camera: vtkCamera | undefined): CameraOptions | undefined {
  if (!camera || !camera.getFocalPoint) {
    // Dead branch in practice (a real vtkCamera always has getFocalPoint); kept for parity with the original defensive check.
    return camera as CameraOptions | undefined;
  }
  return {
    focal_point: [...(camera.getFocalPoint() ?? [0, 0, 0])] as Vector3,
    view_up: [...(camera.getViewUp() ?? [0, 0, 0])] as Vector3,
    position: [...(camera.getPosition() ?? [0, 0, 0])] as Vector3,
    view_angle: camera.getViewAngle(),
    clipping_range: [...(camera.getClippingRange() ?? [0, 0])] as [number, number],
    distance: camera.getDistance(),
  };
}

function performSyncRemoteCamera(): void {
  const { genericRenderWindow, camera_options, remoteRender } =
    useHybridViewerStore() as unknown as HybridViewerStorePublic;
  const viewerStore = useViewerStore();
  const renderer = genericRenderWindow.value!.getRenderer();
  const camera = renderer.getActiveCamera();
  const options_camera = getCameraOptions(camera);
  const schema = viewer_schemas.opengeodeweb_viewer.viewer.update_camera;
  const params = {
    camera_options: options_camera,
  };
  viewerStore.request(
    {
      schema,
      params,
    },
    {
      response_function: () => {
        remoteRender();
        if (camera_options) {
          Object.assign(camera_options, options_camera);
        }
      },
    },
  );
}

function applyCameraOptions(
  camera: vtkCamera | undefined,
  options: CameraOptions | undefined,
): void {
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

function performSetCamera(targetCameraOptions: CameraOptions): void {
  const hybridViewerStore = useHybridViewerStore();
  const { genericRenderWindow } = hybridViewerStore as unknown as HybridViewerStorePublic;
  const { is_moving } = storeToRefs(hybridViewerStore) as unknown as { is_moving: Ref<boolean> };
  const imageStyle = getImageStyle() as { opacity: number } | undefined;
  const renderer = genericRenderWindow.value!.getRenderer();
  const camera = renderer.getActiveCamera();
  const startState = getCameraOptions(camera);
  const duration = computeAnimationDuration(startState!, targetCameraOptions);
  is_moving.value = true;
  if (imageStyle) {
    imageStyle.opacity = 0;
  }
  animateCamera({
    camera,
    startState: startState!,
    targetState: targetCameraOptions,
    duration,
    bumpMultiplier: 0,
    easeExponent: EASE_EXPONENT,
    onUpdate: () => {
      const renderWindow = genericRenderWindow.value!.getRenderWindow();
      renderWindow.render();
    },
    onEnd: () => {
      applyCameraOptions(camera, targetCameraOptions);
      const renderWindow = genericRenderWindow.value!.getRenderWindow();
      renderWindow.render();
      is_moving.value = false;
      performSyncRemoteCamera();
    },
  });
}

async function performFocusCameraOnObject(id: string, block_ids: string[] = []): Promise<void> {
  const { genericRenderWindow, hybridDb } =
    useHybridViewerStore() as unknown as HybridViewerStorePublic;
  if (!hybridDb[id]) {
    return;
  }
  const viewerStore = useViewerStore();
  let bounds: number[] = [];
  if (block_ids.length > 0) {
    const schema = viewer_schemas.opengeodeweb_viewer.model.get_blocks_bounds;
    const params = {
      id,
      block_ids,
    };
    bounds = (await viewerStore.request({
      schema,
      params,
    })) as number[];
  } else {
    bounds = hybridDb[id].actor.getBounds();
  }
  const renderer = genericRenderWindow.value!.getRenderer();
  const camera = renderer.getActiveCamera();
  const startOptions = getCameraOptions(camera);
  renderer.resetCamera(bounds as [number, number, number, number, number, number]);
  const targetOptions = getCameraOptions(camera);
  applyCameraOptions(camera, startOptions);
  performSetCamera(targetOptions!);
}

function performCameraOrientation(orientation: string): void {
  const config = ORIENTATIONS[orientation.toLowerCase()];
  if (!config) {
    return;
  }
  const hybridViewerStore = useHybridViewerStore();
  const { genericRenderWindow } = hybridViewerStore as unknown as HybridViewerStorePublic;
  const { is_moving } = storeToRefs(hybridViewerStore) as unknown as { is_moving: Ref<boolean> };
  const imageStyle = getImageStyle() as { opacity: number } | undefined;
  const renderer = genericRenderWindow.value!.getRenderer();
  const camera = renderer.getActiveCamera();
  const startState = getCameraOptions(camera);
  applyCameraOptions(camera, {
    ...config,
    focal_point: [0, 0, 0],
  } as CameraOptions);
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
    startState: startState!,
    targetState: targetState!,
    duration,
    bumpMultiplier: BUMP_MULTIPLIER,
    easeExponent: EASE_EXPONENT,
    onUpdate: () => {
      const renderWindow = genericRenderWindow.value!.getRenderWindow();
      renderWindow.render();
    },
    onEnd: () => {
      is_moving.value = false;
      performSyncRemoteCamera();
    },
  });
}

function useHybridViewerCamera() {
  const camera_options = reactive<Record<string, unknown>>({});
  function syncRemoteCamera(): void {
    performSyncRemoteCamera();
  }
  function setCamera(targetCameraOptions: CameraOptions): void {
    performSetCamera(targetCameraOptions);
  }
  function resetCamera(): void {
    const { genericRenderWindow } = useHybridViewerStore() as unknown as HybridViewerStorePublic;
    const renderer = genericRenderWindow.value!.getRenderer();
    renderer.resetCamera();
    const renderWindow = genericRenderWindow.value!.getRenderWindow();
    renderWindow.render();
    syncRemoteCamera();
  }
  async function focusCameraOnObject(id: string, block_ids: string[] = []): Promise<void> {
    await performFocusCameraOnObject(id, block_ids);
  }
  function setCameraOrientation(orientation: string): void {
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

function centerCameraOnPosition(
  camera: vtkCamera | undefined,
  pickedPosition: Vector3 | undefined,
): void {
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

interface CameraSnapshot {
  zScale?: number;
  camera_options?: CameraOptions;
}

async function applySnapshot(snapshot: CameraSnapshot | undefined): Promise<void> {
  if (!snapshot) {
    return;
  }
  const { setZScaling, setCamera } = useHybridViewerStore() as unknown as HybridViewerStorePublic;
  if (typeof snapshot.zScale === "number") {
    await setZScaling(snapshot.zScale);
  }
  if (snapshot.camera_options) {
    setCamera(snapshot.camera_options);
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
