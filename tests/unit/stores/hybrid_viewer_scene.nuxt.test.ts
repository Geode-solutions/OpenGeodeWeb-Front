import { describe, expect, test } from "vitest";

import { explodeAlongZ } from "@ogw_internal/stores/hybrid_viewer/explode";
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

const COMPACT_Z_MAX = 10;
const EXPLODED_Z_MIN = 2;
const EXPLODED_Z_MAX = 32;
const TOP_X = 5;
const TOP_Y = 6;

describe("explodeAlongZ helper", () => {
  test("stretches the compact points along z over the exploded bounds", () => {
    const compactPoints = Float64Array.from([
      1,
      2,
      0,
      3,
      4,
      COMPACT_Z_MAX / 2,
      TOP_X,
      TOP_Y,
      COMPACT_Z_MAX,
    ]);
    const points = new Float32Array(compactPoints.length);

    explodeAlongZ(compactPoints, points, [0, 1, 0, 1, EXPLODED_Z_MIN, EXPLODED_Z_MAX]);

    const middleZ = (EXPLODED_Z_MIN + EXPLODED_Z_MAX) / 2;
    expect([...points]).toStrictEqual([
      1,
      2,
      EXPLODED_Z_MIN,
      3,
      4,
      middleZ,
      TOP_X,
      TOP_Y,
      EXPLODED_Z_MAX,
    ]);
  });

  test("restores the compact points when the data is no longer exploded", () => {
    const compactPoints = Float64Array.from([1, 2, 0, 3, 4, COMPACT_Z_MAX]);
    const points = new Float64Array(compactPoints.length);

    explodeAlongZ(compactPoints, points, [1, 3, 2, 4, 0, COMPACT_Z_MAX]);

    expect([...points]).toStrictEqual([...compactPoints]);
  });
});
