// The mesh suites, by their path in tests/browser/tests (see ../index.ts)

// Local imports
import { registerTests as edgedCurve } from "./edged_curve";
import { registerTests as grid2d } from "./grid2d";
import { registerTests as grid3d } from "./grid3d";
import { registerTests as pointSet } from "./point_set";
import { registerTests as polygonalSurface } from "./polygonal_surface";
import { registerTests as solid } from "./solid";
import { registerTests as tetrahedralSolid } from "./tetrahedral_solid";
import { registerTests as triangulatedSurface } from "./triangulated_surface";

import type { SuiteRuntime } from "#browser_helpers/suite_runtime";

const suites: Record<string, (runtime: SuiteRuntime) => void> = {
  "mesh/edged_curve": edgedCurve,
  "mesh/grid2d": grid2d,
  "mesh/grid3d": grid3d,
  "mesh/point_set": pointSet,
  "mesh/polygonal_surface": polygonalSurface,
  "mesh/solid": solid,
  "mesh/tetrahedral_solid": tetrahedralSolid,
  "mesh/triangulated_surface": triangulatedSurface,
};

export { suites };
