import type { CameraOptions, Vector3, vtkCamera, vtkOpenGLRenderWindow } from "./vtk_types";
import {
  LONG_ANIMATION_DURATION,
  SHORT_ANIMATION_DURATION,
  animateCamera,
  computeAnimationDuration,
} from "./camera_animation";
import { requireRenderWindow, useHybridViewerCore } from "./core";
import { dot } from "@kitware/vtk.js/Common/Core/Math";
import { useHybridViewerScene } from "./scene";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

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

function getImageStyle(): CSSStyleDeclaration | undefined {
  const { genericRenderWindow } = useHybridViewerCore();
  if (!genericRenderWindow.value) {
    return undefined;
  }
  // oxlint-disable-next-line no-unsafe-assignment -- vtk.js has no types for getApiSpecificRenderWindow(); narrowed below.
  const apiSpecificRenderWindow = genericRenderWindow.value.getApiSpecificRenderWindow();
  // oxlint-disable-next-line no-unsafe-type-assertion -- trusted vtk.js OpenGL render window API boundary.
  const webGLRenderWindow = apiSpecificRenderWindow as unknown as vtkOpenGLRenderWindow;
  const bgImage: unknown = webGLRenderWindow.getReferenceByName("bgImage");
  return bgImage instanceof HTMLImageElement ? bgImage.style : undefined;
}

function getCameraOptions(camera: vtkCamera): CameraOptions {
  return {
    focal_point: [...(camera.getFocalPoint() ?? [0, 0, 0])] as Vector3,
    view_up: [...(camera.getViewUp() ?? [0, 0, 0])] as Vector3,
    position: [...(camera.getPosition() ?? [0, 0, 0])] as Vector3,
    view_angle: camera.getViewAngle(),
    clipping_range: [...(camera.getClippingRange() ?? [0, 0])] as [number, number],
    distance: camera.getDistance(),
  };
}

function applyCameraOptions(
  camera: vtkCamera | undefined,
  options: Partial<CameraOptions> | undefined,
): void {
  if (camera && options) {
    camera.set({
      focalPoint: options.focal_point,
      viewUp: options.view_up,
      position: options.position,
      viewAngle: options.view_angle,
      clippingRange: options.clipping_range,
    });
  }
}

const BOUNDS_LENGTH = 6;

function isBounds(value: unknown): value is [number, number, number, number, number, number] {
  return (
    Array.isArray(value) &&
    value.length === BOUNDS_LENGTH &&
    value.every((item): item is number => typeof item === "number")
  );
}

function toBounds(value: unknown): [number, number, number, number, number, number] {
  if (!isBounds(value)) {
    throw new Error("Expected a six-element numeric bounds array");
  }
  return value;
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

// Shared via createSharedComposable (rather than merged into the parent hybridViewer store) so sibling slices, e.g. viewport.ts and ruler.ts, can read camera_options/setCamera/syncRemoteCamera directly without importing the parent store and creating a cycle. A Pinia store would work too but its $id/$patch/... properties would leak into the composed store's spread and collapse its inferred type.
const useHybridViewerCamera = createSharedComposable(() => {
  const camera_options = reactive<Record<string, unknown>>({});

  function performSyncRemoteCamera(): void {
    const { genericRenderWindow, remoteRender } = useHybridViewerCore();
    const viewerStore = useViewerStore();
    const renderer = requireRenderWindow(genericRenderWindow).getRenderer();
    const camera = renderer.getActiveCamera();
    const options_camera = getCameraOptions(camera);
    const schema = viewer_schemas.opengeodeweb_viewer.viewer.update_camera;
    const params = {
      camera_options: options_camera,
    };
    viewerStore
      .request(
        {
          schema,
          params,
        },
        {
          response_function: async () => {
            await remoteRender().catch(() => undefined);
            Object.assign(camera_options, options_camera);
          },
        },
      )
      // oxlint-disable-next-line promise/prefer-await-to-then -- fire-and-forget inside a sync caller; see codebase convention in global_attribute_style.ts.
      .catch(() => undefined);
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
        const renderWindow = requireRenderWindow(genericRenderWindow).getRenderWindow();
        renderWindow.render();
      },
      onEnd: () => {
        applyCameraOptions(camera, targetCameraOptions);
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

  async function performFocusCameraOnObject(id: string, block_ids: string[] = []): Promise<void> {
    const { genericRenderWindow } = useHybridViewerCore();
    const { hybridDb } = useHybridViewerScene();
    if (!hybridDb[id]) {
      return;
    }
    const viewerStore = useViewerStore();
    const bounds: [number, number, number, number, number, number] =
      block_ids.length > 0
        ? toBounds(
            await viewerStore.request({
              schema: viewer_schemas.opengeodeweb_viewer.model.get_blocks_bounds,
              params: {
                id,
                block_ids,
              },
            }),
          )
        : hybridDb[id].actor.getBounds();
    const renderer = requireRenderWindow(genericRenderWindow).getRenderer();
    const camera = renderer.getActiveCamera();
    const startOptions = getCameraOptions(camera);
    renderer.resetCamera(bounds);
    const targetOptions = getCameraOptions(camera);
    applyCameraOptions(camera, startOptions);
    performSetCamera(targetOptions);
  }

  async function focusCameraOnObject(id: string, block_ids: string[] = []): Promise<void> {
    await performFocusCameraOnObject(id, block_ids);
  }

  function performCameraOrientation(orientation: string): void {
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
        performSyncRemoteCamera();
      },
    });
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
  applySnapshot,
  centerCameraOnPosition,
  getCameraOptions,
  useHybridViewerCamera,
};
export type { CameraSnapshot };
