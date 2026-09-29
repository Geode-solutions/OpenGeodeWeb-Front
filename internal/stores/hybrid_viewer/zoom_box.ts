import type { CameraOptions, Vector3 } from "./vtk_types";
import {
  applyCameraOptions,
  centerCameraOnPosition,
  getCameraOptions,
  useHybridViewerCamera,
} from "./camera";
import { requireRenderWindow, useHybridViewerCore } from "./core";
import type { Position } from "@vueuse/core";
import { useViewerStore } from "@ogw_front/stores/viewer";
import { newInstance as vtkCamera } from "@kitware/vtk.js/Rendering/Core/Camera";

interface ZoomBox {
  start: Position;
  end: Position;
}

interface Viewport {
  width: number;
  height: number;
}

function viewportShapedBox(start: Position, end: Position, { width, height }: Viewport): ZoomBox {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const aspect = Math.max(width, 1) / Math.max(height, 1);
  const boxWidth = Math.max(Math.abs(deltaX), Math.abs(deltaY) * aspect);
  return {
    start,
    end: {
      x: start.x + (Math.sign(deltaX) || 1) * boxWidth,
      y: start.y + (Math.sign(deltaY) || 1) * (boxWidth / aspect),
    },
  };
}

function computeZoomToBoxCamera(
  camera: CameraOptions,
  box: ZoomBox,
  { width }: Viewport,
  target: Vector3,
): CameraOptions {
  const zoomCamera = vtkCamera();
  applyCameraOptions(zoomCamera, camera);
  centerCameraOnPosition(zoomCamera, target);
  // The box is viewport-shaped (see viewportShapedBox), so its width alone gives the zoom factor.
  zoomCamera.dolly(width / Math.abs(box.end.x - box.start.x));
  return getCameraOptions(zoomCamera);
}

const useHybridViewerZoomBox = createSharedComposable(() => {
  const is_zoom_box_active = ref(false);

  // Leaves the mode first so a second box cannot be drawn while the pick is pending. Request errors are reported by the viewer store.
  async function zoomToBox(box: ZoomBox, viewport: Viewport): Promise<void> {
    is_zoom_box_active.value = false;
    const target = await useViewerStore().pick_world_position(
      (box.start.x + box.end.x) / 2,
      viewport.height - (box.start.y + box.end.y) / 2,
    );
    const { genericRenderWindow } = useHybridViewerCore();
    const { setCamera } = useHybridViewerCamera();
    const camera = requireRenderWindow(genericRenderWindow).getRenderer().getActiveCamera();
    setCamera(computeZoomToBoxCamera(getCameraOptions(camera), box, viewport, target));
  }

  return {
    is_zoom_box_active,
    zoomToBox,
  };
});

export { computeZoomToBoxCamera, useHybridViewerZoomBox, viewportShapedBox };
export type { ZoomBox };
