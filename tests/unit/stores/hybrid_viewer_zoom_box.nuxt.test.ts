// Third party imports
import { describe, expect, test, vi } from "vitest";
import { newInstance as vtkCamera } from "@kitware/vtk.js/Rendering/Core/Camera";

// Local imports
import type { CameraOptions, Vector3 } from "@ogw_internal/stores/hybrid_viewer/vtk_types";
import {
  computeZoomToBoxCamera,
  useHybridViewerZoomBox,
  viewportShapedBox,
} from "@ogw_internal/stores/hybrid_viewer/zoom_box";
import { getCameraOptions, useHybridViewerCamera } from "@ogw_internal/stores/hybrid_viewer/camera";
import { useHybridViewerCore } from "@ogw_internal/stores/hybrid_viewer/core";
import { useViewerStore } from "@ogw_front/stores/viewer";

const DISTANCE = 100;
const VIEW_ANGLE = 30;
const PRECISION = 6;
const VIEWPORT = { width: 200, height: 100 };
const FULL_BOX = { start_x: 0, start_y: 0, end_x: 200, end_y: 100 };
const HALF_BOX = { start_x: 100, start_y: -5, end_x: 200, end_y: 45 };
const REVERSED_HALF_BOX = { start_x: 200, start_y: 45, end_x: 100, end_y: -5 };
const HALF = 0.5;
const TARGET_X = 10;
const TARGET_Y = 20;
const TARGET_Z = 40;
const TARGET: Vector3 = [TARGET_X, TARGET_Y, TARGET_Z];
const TARGET_DEPTH = DISTANCE - TARGET_Z;

function makeCamera(): CameraOptions {
  return getCameraOptions(
    vtkCamera({ position: [0, 0, DISTANCE], focalPoint: [0, 0, 0], viewAngle: VIEW_ANGLE }),
  );
}

function closeTo(vector: Vector3): unknown[] {
  return vector.map((value): unknown => expect.closeTo(value, PRECISION));
}

describe("viewportShapedBox helper", () => {
  const start = { x: 10, y: 10 };

  test.each([
    ["down-right", { x: 60, y: 60 }, { start_x: 10, start_y: 10, end_x: 110, end_y: 60 }],
    ["up-left", { x: 0, y: 5 }, { start_x: 10, start_y: 10, end_x: 0, end_y: 5 }],
    ["horizontally", { x: 50, y: 10 }, { start_x: 10, start_y: 10, end_x: 50, end_y: 30 }],
  ])("grows a box dragged %s to the viewport aspect ratio", (_direction, end, expected) => {
    expect(viewportShapedBox(start, end, VIEWPORT)).toStrictEqual(expected);
  });
});

describe("computeZoomToBoxCamera helper", () => {
  test("full viewport box around the focal point keeps the camera unchanged", () => {
    const camera = makeCamera();
    const result = computeZoomToBoxCamera(camera, FULL_BOX, VIEWPORT, camera.focal_point);

    expect(result.position).toStrictEqual(closeTo(camera.position));
    expect(result.focal_point).toStrictEqual(closeTo(camera.focal_point));
  });

  test("centers on the target and dollies from its depth by the box scale", () => {
    for (const box of [HALF_BOX, REVERSED_HALF_BOX]) {
      const result = computeZoomToBoxCamera(makeCamera(), box, VIEWPORT, TARGET);

      expect(result.focal_point).toStrictEqual(closeTo(TARGET));
      expect(result.position).toStrictEqual(
        closeTo([TARGET_X, TARGET_Y, TARGET_Z + TARGET_DEPTH * HALF]),
      );
      expect(result.view_angle).toBe(VIEW_ANGLE);
    }
  });
});

describe("zoomToBox", () => {
  test("zooms on the point picked at the box center and leaves the mode", async () => {
    const camera = vtkCamera({ position: [0, 0, DISTANCE], focalPoint: [0, 0, 0] });
    const renderWindow = {
      getRenderer: (): { getActiveCamera: () => typeof camera } => ({
        getActiveCamera: (): typeof camera => camera,
      }),
    };
    const { genericRenderWindow } = useHybridViewerCore();
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    genericRenderWindow.value = renderWindow as never;
    const request = vi
      .spyOn(useViewerStore(), "request")
      .mockResolvedValue({ x: TARGET_X, y: TARGET_Y, z: TARGET_Z });
    const setCamera = vi.spyOn(useHybridViewerCamera(), "setCamera").mockReturnValue();
    const zoomBox = useHybridViewerZoomBox();
    zoomBox.is_zoom_box_active.value = true;
    const expected = computeZoomToBoxCamera(getCameraOptions(camera), HALF_BOX, VIEWPORT, TARGET);

    await zoomBox.zoomToBox(HALF_BOX, VIEWPORT);

    expect(request).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ params: { x: 150, y: 80 } }),
    );
    expect(setCamera).toHaveBeenCalledExactlyOnceWith(expected);
    expect(zoomBox.is_zoom_box_active.value).toBe(false);
  });
});
