import type { CameraOptions, Vector3, vtkCamera, vtkOpenGLRenderWindow } from "./vtk_types";
import { dot } from "@kitware/vtk.js/Common/Core/Math";
import { useHybridViewerCore } from "./core";

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
  const position = camera.getPosition();
  const directionOfProjection = camera.getDirectionOfProjection();
  const distance = dot(
    [
      pickedPosition[0] - position[0],
      pickedPosition[1] - position[1],
      pickedPosition[2] - position[2],
    ],
    directionOfProjection,
  );
  camera.setFocalPoint(...pickedPosition);
  camera.setPosition(
    pickedPosition[0] - distance * directionOfProjection[0],
    pickedPosition[1] - distance * directionOfProjection[1],
    pickedPosition[2] - distance * directionOfProjection[2],
  );
}

export {
  ALIGNMENT_THRESHOLD,
  BUMP_MULTIPLIER,
  EASE_EXPONENT,
  ORIENTATIONS,
  applyCameraOptions,
  centerCameraOnPosition,
  getImageStyle,
  toBounds,
};
