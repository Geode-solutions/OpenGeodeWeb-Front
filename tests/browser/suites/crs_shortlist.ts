// Local imports
import { LAMBERT_93, POINTSET_FILE, POINTSET_NAME, UTM_31N } from "#browser_helpers/crs_test_data";
import { confirmAssign, openCrsFromTree, selectCrs } from "#browser_helpers/crs";
import { expectCrsChip, toggleFavoriteCrs } from "#browser_helpers/crs_shortlist";
import { closeCrsDialog } from "#browser_helpers/crs_flows";
import { pointSetGeodeObjectType } from "#browser_helpers/constants";

import type { SuiteRuntime } from "#browser_helpers/suite_runtime";

// Shared with the apps built on this layer: each one runs it with its own test fixture and data loader
function registerTests({ test, loadTestDatas }: SuiteRuntime): void {
  test.describe.configure({ mode: "serial" });

  test("load a point set", async ({ window }) => {
    await loadTestDatas(window, [POINTSET_FILE]);
  });

  test("a starred crs becomes a favorite chip", async ({ window }) => {
    await openCrsFromTree(window, pointSetGeodeObjectType, POINTSET_NAME);
    await toggleFavoriteCrs(window, UTM_31N);
    await expectCrsChip(window, "crsFavoriteChip", "EPSG:32631");
  });

  test("assign a crs", async ({ window }) => {
    await selectCrs(window, LAMBERT_93);
    await confirmAssign(window);
  });

  test("the favorite and the assigned crs come back as chips", async ({ window }) => {
    await openCrsFromTree(window, pointSetGeodeObjectType, POINTSET_NAME);
    await expectCrsChip(window, "crsFavoriteChip", "EPSG:32631");
    await expectCrsChip(window, "crsRecentChip", "EPSG:2154");
    await closeCrsDialog(window);
  });
}

export { registerTests };
