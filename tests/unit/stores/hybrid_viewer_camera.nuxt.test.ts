import { describe, expect, test } from "vitest";

import type { Vector3 } from "@ogw_internal/stores/hybrid_viewer/vtk_types";
import { centerCameraOnPosition } from "@ogw_internal/stores/hybrid_viewer/camera";
import { newInstance as vtkCamera } from "@kitware/vtk.js/Rendering/Core/Camera";

const INITIAL_CAMERA_Z = 100;
const PICKED_X = 20;
const PICKED_Y = 30;
const PICKED_Z = 80;

describe("centerCameraOnPosition helper", () => {
  test("preserves distance along view direction and centers on picked position", () => {
    const camera = vtkCamera();
    camera.setPosition(0, 0, INITIAL_CAMERA_Z);
    camera.setFocalPoint(0, 0, 0);

    const pickedPosition: Vector3 = [PICKED_X, PICKED_Y, PICKED_Z];
    centerCameraOnPosition(camera, pickedPosition);

    expect(camera.getFocalPoint()).toStrictEqual(pickedPosition);
    expect(camera.getPosition()).toStrictEqual([PICKED_X, PICKED_Y, INITIAL_CAMERA_Z]);
    expect(camera.getDirectionOfProjection()).toStrictEqual([0, 0, -1]);
  });

  test("handles undefined inputs gracefully", () => {
    const camera = vtkCamera();
    camera.setPosition(0, 0, INITIAL_CAMERA_Z);
    camera.setFocalPoint(0, 0, 0);

    centerCameraOnPosition(undefined, [1, 2, 3]);
    centerCameraOnPosition(camera, undefined);

    expect(camera.getPosition()).toStrictEqual([0, 0, INITIAL_CAMERA_Z]);
    expect(camera.getFocalPoint()).toStrictEqual([0, 0, 0]);
  });
});
