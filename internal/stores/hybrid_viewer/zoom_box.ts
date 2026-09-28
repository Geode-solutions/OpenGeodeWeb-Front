import type { CameraOptions, Vector3 } from "./vtk_types";
import {
  applyCameraOptions,
  centerCameraOnPosition,
  getCameraOptions,
  useHybridViewerCamera,
} from "./camera";
import { requireRenderWindow, useHybridViewerCore } from "./core";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";
import { newInstance as vtkCamera } from "@kitware/vtk.js/Rendering/Core/Camera";

interface ZoomBox {
  start_x: number;
  start_y: number;
  end_x: number;
  end_y: number;
}

interface Viewport {
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
}

function viewportShapedBox(start: Point, end: Point, { width, height }: Viewport): ZoomBox {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const aspect = Math.max(width, 1) / Math.max(height, 1);
  const boxWidth = Math.max(Math.abs(deltaX), Math.abs(deltaY) * aspect);
  return {
    start_x: start.x,
    start_y: start.y,
    end_x: start.x + (Math.sign(deltaX) || 1) * boxWidth,
    end_y: start.y + (Math.sign(deltaY) || 1) * (boxWidth / aspect),
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
  zoomCamera.dolly(width / Math.abs(box.end_x - box.start_x));
  return getCameraOptions(zoomCamera);
}

async function pickPointAtBoxCenter(box: ZoomBox, height: number): Promise<Vector3> {
  const viewerStore = useViewerStore();
  const schema = viewer_schemas.opengeodeweb_viewer.viewer.get_point_position;
  const params = {
    x: Math.round((box.start_x + box.end_x) / 2),
    y: Math.round(height - (box.start_y + box.end_y) / 2),
  };
  // oxlint-disable-next-line no-unsafe-type-assertion
  const { x, y, z } = (await viewerStore.request({ schema, params })) as {
    x: number;
    y: number;
    z: number;
  };
  return [x, y, z];
}

const useHybridViewerZoomBox = createSharedComposable(() => {
  const is_zoom_box_active = ref(false);

  async function zoomToBox(box: ZoomBox, viewport: Viewport): Promise<void> {
    is_zoom_box_active.value = false;
    const target = await pickPointAtBoxCenter(box, viewport.height);
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
