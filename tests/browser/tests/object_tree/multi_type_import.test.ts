// Node imports

// Third party imports
import { expect } from "@playwright/test";

// Local imports
import { brepGeodeObjectType, polygonalSurfaceGeodeObjectType } from "@ogw_tests/browser/helpers/constants";
import { expandMainObjectTree } from "@ogw_tests/browser/helpers/object_trees/main_object_tree";
import { loadVeaseTestDatas } from "@ogw_tests/browser/shim/load";
import { test } from "@ogw_tests/browser/shim/fixtures";

// Constants
// These files share no geode object type: each one is imported with its own
const BREP_FILE = "test.og_brep";
const POLYGONAL_SURFACE_FILE = "test.og_psf3d";

test.use({ suiteId: import.meta.url });
test.describe.configure({ mode: "serial" });

test("load files of different types together", async ({ window }) => {
  await loadVeaseTestDatas(window, [POLYGONAL_SURFACE_FILE, BREP_FILE]);
  await expandMainObjectTree(window);
  const treeRows = window.getByTestId("mainObjectTree").getByTestId("treeRowWrapper");
  await expect(treeRows.filter({ hasText: brepGeodeObjectType }).first()).toBeVisible();
  await expect(treeRows.filter({ hasText: polygonalSurfaceGeodeObjectType }).first()).toBeVisible();
});
