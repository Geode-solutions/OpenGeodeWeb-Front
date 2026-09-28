// Third party imports
import { describe, expect, test } from "vitest";

// Local imports
import { areAllGrids } from "@ogw_front/utils/clipping_planes";

const TIMEOUT_MS = 5000;

const items = [
  { id: "grid2d", geode_object_type: "RegularGrid2D" },
  { id: "lightGrid2d", geode_object_type: "LightRegularGrid2D" },
  { id: "grid3d", geode_object_type: "RegularGrid3D" },
  { id: "lightGrid3d", geode_object_type: "LightRegularGrid3D" },
  { id: "surface", geode_object_type: "TriangulatedSurface3D" },
  { id: "brep", geode_object_type: "BRep" },
];

describe("grid detection for slice option", () => {
  test(
    "true when every targeted id is a 2D or 3D grid",
    () => {
      expect(areAllGrids(items, ["grid2d", "lightGrid2d", "grid3d", "lightGrid3d"])).toBe(true);
    },
    TIMEOUT_MS,
  );

  test(
    "false when a targeted id is not a grid",
    () => {
      expect(areAllGrids(items, ["grid3d", "surface"])).toBe(false);
      expect(areAllGrids(items, ["brep"])).toBe(false);
    },
    TIMEOUT_MS,
  );

  test(
    "ignores untargeted non grid items",
    () => {
      expect(areAllGrids(items, ["grid2d"])).toBe(true);
    },
    TIMEOUT_MS,
  );

  test(
    "false when nothing is targeted",
    () => {
      expect(areAllGrids(items, [])).toBe(false);
    },
    TIMEOUT_MS,
  );
});
