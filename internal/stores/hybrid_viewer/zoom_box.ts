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

  function zoomToBox(box: ZoomBox, width: number, height: number): void {
    const { genericRenderWindow } = useHybridViewerCore();
    const { setCamera } = useHybridViewerCamera();
    const camera = requireRenderWindow(genericRenderWindow).getRenderer().getActiveCamera();
    setCamera(computeZoomToBoxCamera(getCameraOptions(camera), box, width, height));
    is_zoom_box_active.value = false;
  }

  return {
    is_zoom_box_active,
    zoomToBox,
  };
});

export { computeZoomToBoxCamera, useHybridViewerZoomBox };
export type { ZoomBox };
