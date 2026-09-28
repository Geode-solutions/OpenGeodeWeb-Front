import { degreesFromRadians, radiansFromDegrees } from "@kitware/vtk.js/Common/Core/Math";
import { getCameraOptions, useHybridViewerCamera } from "./camera";
import { requireRenderWindow, useHybridViewerCore } from "./core";
import type { CameraOptions } from "./vtk_types";
import { newInstance as vtkCamera } from "@kitware/vtk.js/Rendering/Core/Camera";

interface ZoomBox {
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
}

const MIN_ZOOM_BOX_PIXELS = 5;

function isZoomBoxValid(box: ZoomBox | undefined): box is ZoomBox {
  return (
    box !== undefined &&
    Math.abs(box.x_max - box.x_min) >= MIN_ZOOM_BOX_PIXELS &&
    Math.abs(box.y_max - box.y_min) >= MIN_ZOOM_BOX_PIXELS
  );
}

function constrainZoomBoxToViewport(
  start: { x: number; y: number },
  current: { x: number; y: number },
  width: number,
  height: number,
): ZoomBox {
  const deltaX = current.x - start.x;
  const deltaY = current.y - start.y;
  if (width <= 0 || height <= 0) {
    return { x_min: start.x, y_min: start.y, x_max: current.x, y_max: current.y };
  }
  const aspect = width / height;
  const boxWidth = Math.max(Math.abs(deltaX), Math.abs(deltaY) * aspect);
  const boxHeight = boxWidth / aspect;
  return {
    x_min: start.x,
    y_min: start.y,
    x_max: start.x + (deltaX < 0 ? -boxWidth : boxWidth),
    y_max: start.y + (deltaY < 0 ? -boxHeight : boxHeight),
  };
}

function computeZoomToBoxCamera(
  camera: CameraOptions,
  box: ZoomBox,
  width: number,
  height: number,
): CameraOptions {
  const zoomCamera = vtkCamera({
    position: [...camera.position],
    focalPoint: [...camera.focal_point],
    viewUp: [...camera.view_up],
    viewAngle: camera.view_angle,
    clippingRange: [...camera.clipping_range],
  });
  const halfTan = Math.tan(radiansFromDegrees(camera.view_angle / 2));
  const tanPerPixel = (2 * halfTan) / height;
  const horizontalTan = ((box.x_min + box.x_max) / 2 - width / 2) * tanPerPixel;
  const verticalTan = (height / 2 - (box.y_min + box.y_max) / 2) * tanPerPixel;
  const pitchTan = verticalTan / Math.hypot(1, horizontalTan);
  zoomCamera.yaw(-degreesFromRadians(Math.atan(horizontalTan)));
  zoomCamera.pitch(degreesFromRadians(Math.atan(pitchTan)));
  zoomCamera.orthogonalizeViewUp();
  const scale = Math.max(
    Math.abs(box.x_max - box.x_min) / width,
    Math.abs(box.y_max - box.y_min) / height,
  );
  zoomCamera.setViewAngle(2 * degreesFromRadians(Math.atan(halfTan * scale)));
  return getCameraOptions(zoomCamera);
}

const useHybridViewerZoomBox = createSharedComposable(() => {
  const is_zoom_box_active = ref(false);
  const zoom_box = ref<ZoomBox | undefined>(undefined);
  const zoom_box_viewport = ref<{ width: number; height: number }>({ width: 0, height: 0 });
  const is_zoom_box_ready = computed(() => isZoomBoxValid(zoom_box.value));

  function activateZoomBox(): void {
    const { is_picking } = useHybridViewerCore();
    is_picking.value = false;
    zoom_box.value = undefined;
    is_zoom_box_active.value = true;
  }

  function deactivateZoomBox(): void {
    is_zoom_box_active.value = false;
    zoom_box.value = undefined;
  }

  function setZoomBox(box: ZoomBox | undefined, width: number, height: number): void {
    zoom_box.value = box;
    zoom_box_viewport.value = { width, height };
  }

  function applyZoomBox(): void {
    const box = zoom_box.value;
    const { width, height } = zoom_box_viewport.value;
    if (!isZoomBoxValid(box) || width <= 0 || height <= 0) {
      return;
    }
    const { genericRenderWindow } = useHybridViewerCore();
    const { setCamera } = useHybridViewerCamera();
    const camera = requireRenderWindow(genericRenderWindow).getRenderer().getActiveCamera();
    setCamera(computeZoomToBoxCamera(getCameraOptions(camera), box, width, height));
    deactivateZoomBox();
  }

  return {
    is_zoom_box_active,
    zoom_box,
    is_zoom_box_ready,
    activateZoomBox,
    deactivateZoomBox,
    setZoomBox,
    applyZoomBox,
  };
});

export {
  computeZoomToBoxCamera,
  constrainZoomBoxToViewport,
  isZoomBoxValid,
  useHybridViewerZoomBox,
};
export type { ZoomBox };
