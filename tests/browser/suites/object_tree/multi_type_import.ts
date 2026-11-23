// Node imports

// Third party imports
import { expect } from "@playwright/test";

// Local imports
import { brepGeodeObjectType, polygonalSurfaceGeodeObjectType } from "#browser_helpers/constants";
import { expandMainObjectTree } from "#browser_helpers/object_trees/main_object_tree";

import type { SuiteRuntime } from "#browser_helpers/suite_runtime";

// Constants
// These files share no geode object type: each one is imported with its own
const BREP_FILE = "test.og_brep";
const POLYGONAL_SURFACE_FILE = "test.og_psf3d";

// Shared with the apps built on this layer: each one runs it with its own test fixture and data loader
function registerTests({ test, loadTestDatas }: SuiteRuntime): void {
  test.describe.configure({ mode: "serial" });

  test("load files of different types together", async ({ window }) => {
    await loadTestDatas(window, [POLYGONAL_SURFACE_FILE, BREP_FILE]);
    await expandMainObjectTree(window);
    const treeRows = window.getByTestId("mainObjectTree").getByTestId("treeRowWrapper");
    await expect(treeRows.filter({ hasText: brepGeodeObjectType }).first()).toBeVisible();
    await expect(
      treeRows.filter({ hasText: polygonalSurfaceGeodeObjectType }).first(),
    ).toBeVisible();
  });
}

export { registerTests };
