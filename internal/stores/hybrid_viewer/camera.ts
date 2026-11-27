import { EASE_EXPONENT, applyCameraOptions, getImageStyle, toBounds } from "./camera_helpers";
import { animateCamera, computeAnimationDuration, getCameraOptions } from "./camera_animation";
import { requireRenderWindow, useHybridViewerCore } from "./core";
import type { CameraOptions } from "./vtk_types";
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import { animateCameraOrientation } from "./camera_orientation";
import { useHybridViewerScene } from "./scene";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Shared via createSharedComposable (rather than merged into the parent hybridViewer store) so sibling slices, e.g. viewport.ts and ruler.ts, can read camera_options/setCamera/syncRemoteCamera directly without importing the parent store and creating a cycle. A Pinia store would work too but its $id/$patch/... properties would leak into the composed store's spread and collapse its inferred type.
const useHybridViewerCamera = createSharedComposable(() => {
  const camera_options = reactive<Record<string, unknown>>({});

  async function syncRemoteCameraAsync(): Promise<void> {
    const { genericRenderWindow, remoteRender } = useHybridViewerCore();
    const viewerStore = useViewerStore();
    const renderer = requireRenderWindow(genericRenderWindow).getRenderer();
    const options_camera = getCameraOptions(renderer.getActiveCamera());
    await viewerStore.request({
      schema: viewer_schemas.opengeodeweb_viewer.viewer.update_camera,
      params: { camera_options: options_camera },
    });
    await remoteRender();
    Object.assign(camera_options, options_camera);
  }

  function performSyncRemoteCamera(): void {
    // oxlint-disable-next-line promise/prefer-await-to-then -- fire-and-forget inside a sync caller; see codebase convention in global_attribute_style.ts.
    syncRemoteCameraAsync().catch(() => undefined);
  }

  function syncRemoteCamera(): void {
    performSyncRemoteCamera();
  }

  function performSetCamera(targetCameraOptions: CameraOptions): void {
    const { genericRenderWindow, is_moving } = useHybridViewerCore();
    const imageStyle = getImageStyle();
    const renderer = requireRenderWindow(genericRenderWindow).getRenderer();
    const camera = renderer.getActiveCamera();
    const startState = getCameraOptions(camera);
    const duration = computeAnimationDuration(startState, targetCameraOptions);
    is_moving.value = true;
    if (imageStyle) {
      imageStyle.opacity = "0";
    }
    animateCamera({
      camera,
      startState,
      targetState: targetCameraOptions,
      duration,
      bumpMultiplier: 0,
      easeExponent: EASE_EXPONENT,
      onUpdate: () => {
        renderer.resetCameraClippingRange();
        const renderWindow = requireRenderWindow(genericRenderWindow).getRenderWindow();
        renderWindow.render();
      },
      onEnd: () => {
        applyCameraOptions(camera, targetCameraOptions);
        renderer.resetCameraClippingRange();
        const renderWindow = requireRenderWindow(genericRenderWindow).getRenderWindow();
        renderWindow.render();
        is_moving.value = false;
        performSyncRemoteCamera();
      },
    });
  }

  function setCamera(targetCameraOptions: CameraOptions): void {
    performSetCamera(targetCameraOptions);
  }

  function resetCamera(): void {
    const { genericRenderWindow } = useHybridViewerCore();
    const renderer = requireRenderWindow(genericRenderWindow).getRenderer();
    renderer.resetCamera();
    const renderWindow = requireRenderWindow(genericRenderWindow).getRenderWindow();
    renderWindow.render();
    syncRemoteCamera();
  }

  async function performFocusCameraOnObject(
    dataId: DataId,
    block_ids: number[] = [],
  ): Promise<void> {
    const { genericRenderWindow } = useHybridViewerCore();
    const { hybridDb } = useHybridViewerScene();
    if (!hybridDb[dataId]) {
      return;
    }
    const viewerStore = useViewerStore();
    let bounds: [number, number, number, number, number, number] =
      hybridDb[dataId].actor.getBounds();
    if (block_ids.length > 0) {
      const response = await viewerStore.request({
        schema: viewer_schemas.opengeodeweb_viewer.model.get_blocks_bounds,
        params: {
          id: dataId,
          block_ids,
        },
      });
      bounds = toBounds(response.bounds);
    }
    const renderer = requireRenderWindow(genericRenderWindow).getRenderer();
    const camera = renderer.getActiveCamera();
    const startOptions = getCameraOptions(camera);
    renderer.resetCamera(bounds);
    const targetOptions = getCameraOptions(camera);
    applyCameraOptions(camera, startOptions);
    performSetCamera(targetOptions);
  }

  async function focusCameraOnObject(dataId: DataId, block_ids: number[] = []): Promise<void> {
    await performFocusCameraOnObject(dataId, block_ids);
  }

  function setCameraOrientation(orientation: string): void {
    animateCameraOrientation(orientation, performSyncRemoteCamera);
  }

  return {
    camera_options,
    syncRemoteCamera,
    syncRemoteCameraAsync,
    setCamera,
    resetCamera,
    focusCameraOnObject,
    setCameraOrientation,
  };
});

interface CameraSnapshot {
  zScale?: number;
  camera_options?: CameraOptions;
}

async function applySnapshot(snapshot: CameraSnapshot | undefined): Promise<void> {
  if (!snapshot) {
    return;
  }
  if (typeof snapshot.zScale === "number") {
    await useHybridViewerScene().setZScaling(snapshot.zScale);
  }
  if (snapshot.camera_options) {
    useHybridViewerCamera().setCamera(snapshot.camera_options);
  }
}
export {
  ALIGNMENT_THRESHOLD,
  BUMP_MULTIPLIER,
  EASE_EXPONENT,
  ORIENTATIONS,
  applyCameraOptions,
  centerCameraOnPosition,
} from "./camera_helpers";
export { applySnapshot, useHybridViewerCamera };
export type { CameraSnapshot };
