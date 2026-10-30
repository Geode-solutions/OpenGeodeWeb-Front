import { describe, expect, test } from "vitest";

import { followZScaling } from "@ogw_internal/stores/hybrid_viewer/scene";
import { newInstance as vtkCamera } from "@kitware/vtk.js/Rendering/Core/Camera";

const FOCAL_X = 10;
const FOCAL_Y = 20;
const FOCAL_Z = -50;
const POSITION_X = 110;
const POSITION_Y = 120;
const POSITION_Z = 50;
const Z_SCALE_RATIO = 3;

describe("followZScaling helper", () => {
  test("keeps the focused point under the camera when the scene is stretched along z", () => {
    const camera = vtkCamera();
    camera.setFocalPoint(FOCAL_X, FOCAL_Y, FOCAL_Z);
    camera.setPosition(POSITION_X, POSITION_Y, POSITION_Z);
    const directionOfProjection = camera.getDirectionOfProjection();
    const distance = camera.getDistance();

    followZScaling(camera, Z_SCALE_RATIO);

    const scaledFocalZ = FOCAL_Z * Z_SCALE_RATIO;
    expect(camera.getFocalPoint()).toStrictEqual([FOCAL_X, FOCAL_Y, scaledFocalZ]);
    expect(camera.getPosition()).toStrictEqual([
      POSITION_X,
      POSITION_Y,
      POSITION_Z + scaledFocalZ - FOCAL_Z,
    ]);
    expect(camera.getDirectionOfProjection()).toStrictEqual(directionOfProjection);
    expect(camera.getDistance()).toBeCloseTo(distance);
  });

  test("leaves the camera untouched when the z scale does not change", () => {
    const camera = vtkCamera();
    camera.setFocalPoint(FOCAL_X, FOCAL_Y, FOCAL_Z);
    camera.setPosition(POSITION_X, POSITION_Y, POSITION_Z);

    followZScaling(camera, 1);

    expect(camera.getFocalPoint()).toStrictEqual([FOCAL_X, FOCAL_Y, FOCAL_Z]);
    expect(camera.getPosition()).toStrictEqual([POSITION_X, POSITION_Y, POSITION_Z]);
  });
});
