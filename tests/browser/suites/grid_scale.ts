// Node imports

// Third party imports

// Local imports
import {
  removeClippingPlanes,
  resetClippingPlanes,
  toggleClippingPlanes,
} from "#browser_helpers/clipping_planes_interaction";
import { resetCamera, toggleGridScale } from "#browser_helpers/camera_interaction";
import { moveMouseOutOfTheWay } from "#browser_helpers/app_interaction";

import type { SuiteRuntime } from "#browser_helpers/suite_runtime";

// Constants
const brepFilename = "test.og_brep";
const rgd3dFilename = "grid.og_rgd3d";

// Shared with the apps built on this layer: each one runs it with its own test fixture and data loader
function registerTests({ test, loadTestDatas }: SuiteRuntime): void {
  test.describe.configure({ mode: "serial" });

  test("load", async ({ window }) => {
    await loadTestDatas(window, [brepFilename]);
    await resetCamera(window);
  });

  test("grid scale fits the clipped data", async ({ window }) => {
    await toggleClippingPlanes(window);
    await toggleGridScale(window);
    await moveMouseOutOfTheWay(window);
  });

  test("grid scale refits after clipping removal", async ({ window }) => {
    await toggleClippingPlanes(window);
    await removeClippingPlanes(window);
    await moveMouseOutOfTheWay(window);
  });

  test("grid scale fits data imported with an active clipping", async ({ window }) => {
    await resetClippingPlanes(window);
    await loadTestDatas(window, [rgd3dFilename]);
    await resetCamera(window);
  });
}

export { registerTests };
