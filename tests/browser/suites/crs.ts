// Third party imports
import { expect } from "@playwright/test";

// Local imports
import {
  ALIGN_SOURCE,
  ALIGN_TARGET,
  BREP_FILE,
  BREP_NAME,
  CC42,
  CURVE_FILE,
  CURVE_NAME,
  LAMBERT_93,
  POINTSET_FILE,
  POINTSET_NAME,
  UTM_31N,
} from "#browser_helpers/crs_test_data";
import {
  applyAlignment,
  confirmAssign,
  confirmConvert,
  confirmProjectCrs,
  expectCrsMismatch,
  expectCurrentCrs,
  expectFeedback,
  expectTreeCrs,
  openCrsFromInfoCard,
  openCrsFromTree,
  openCrsFromWarning,
  openProjectCrs,
  selectConvertMode,
  selectCrs,
  startAlignment,
} from "#browser_helpers/crs";
import {
  assignAnywayToAll,
  closeCrsDialog,
  convertAloneTo,
  expectEveryRowCrs,
  fillAlignment,
  startMisfitAssign,
} from "#browser_helpers/crs_flows";
import {
  brepGeodeObjectType,
  edgedCurveGeodeObjectType,
  pointSetGeodeObjectType,
} from "#browser_helpers/constants";
import { closeFeedbackSnackbar, moveMouseOutOfTheWay } from "#browser_helpers/app_interaction";
import { getMainObjectTree } from "#browser_helpers/object_trees/main_object_tree";
import { waitForActionSettled } from "#browser_helpers/wait_for_action_settled";

import type { SuiteRuntime } from "#browser_helpers/suite_runtime";

// Shared with the apps built on this layer: each one runs it with its own test fixture and data loader
function registerTests({ test, loadTestDatas }: SuiteRuntime): void {
  test.describe.configure({ mode: "serial" });

  test("load objects", async ({ window }) => {
    await loadTestDatas(window, [BREP_FILE]);
    await loadTestDatas(window, [POINTSET_FILE]);
  });

  test("open the crs dialog of the point set", async ({ window }) => {
    await openCrsFromTree(window, pointSetGeodeObjectType, POINTSET_NAME);
    await expectCurrentCrs(window, "None (local coordinates)");
  });

  test("select a crs to assign", async ({ window }) => {
    await selectCrs(window, LAMBERT_93);
  });

  test("assign the selected crs", async ({ window }) => {
    // "This data only" by default: the point set alone, the project follows it
    await confirmAssign(window);
    await expectTreeCrs(window, pointSetGeodeObjectType, POINTSET_NAME, "EPSG:2154");
    await moveMouseOutOfTheWay(window);
  });

  test("current crs is the assigned one", async ({ window }) => {
    await openCrsFromTree(window, pointSetGeodeObjectType, POINTSET_NAME);
    await expectCurrentCrs(window, "EPSG:2154");
  });

  test("open the convert mode", async ({ window }) => {
    await selectConvertMode(window);
  });

  test("select a crs to convert to", async ({ window }) => {
    await selectCrs(window, UTM_31N);
  });

  // "All data" by default: the project moves to UTM; the local model does not fit it and stays
  test("convert to the selected crs", async ({ window }) => {
    await confirmConvert(window);
    await expectTreeCrs(window, pointSetGeodeObjectType, POINTSET_NAME, "EPSG:32631");
    await moveMouseOutOfTheWay(window);
  });

  test("load a curve sharing the model frame", async ({ window }) => {
    // Still in the model frame: the curve keeps no crs until it is georeferenced
    await expectFeedback(window, "these coordinates do not match EPSG:32631", async () => {
      await loadTestDatas(window, [CURVE_FILE]);
    });
    await moveMouseOutOfTheWay(window);
  });

  test("open the alignment panel", async ({ window }) => {
    await openCrsFromTree(window, brepGeodeObjectType, BREP_NAME);
    await startAlignment(window);
    await expect(window.getByTestId("crsAlignPanel")).toBeVisible();
  });

  test("fill the affine alignment points and target crs", async ({ window }) => {
    // "All data" by default: the curve shares the model frame
    await fillAlignment(window, ALIGN_SOURCE, ALIGN_TARGET, LAMBERT_93);
  });

  // The aligned model lies far from the point set, misplaced by the Lambert-93 assigned anyway:
  // Their extent leaves the UTM domain, so the basemap build fails and the basemap is hidden
  test("apply the alignment", async ({ window }) => {
    // The feedback can take up to its own timeout to show
    test.slow();
    await expectFeedback(window, "Area outside the map projection limits", async () => {
      await applyAlignment(window);
    });
    // Only the last build hides the basemap: no other message comes after
    const basemapRow = getMainObjectTree(window)
      .getByTestId("treeRowWrapper")
      .filter({ hasText: "Basemap" });
    await expect(basemapRow.getByTestId("hiddenObjectEyeButton")).toBeVisible();
    await closeFeedbackSnackbar(window);
    await moveMouseOutOfTheWay(window);
  });

  // Typed in Lambert-93, then converted to the project crs (UTM)
  test("current crs is the project one", async ({ window }) => {
    await expectTreeCrs(window, brepGeodeObjectType, BREP_NAME, "EPSG:32631");
    // Aligned in the same request as the model
    await expectTreeCrs(window, edgedCurveGeodeObjectType, CURVE_NAME, "EPSG:32631");
    await moveMouseOutOfTheWay(window);
  });

  test("re-align this data only", async ({ window }) => {
    await openCrsFromTree(window, brepGeodeObjectType, BREP_NAME);
    await startAlignment(window);
    // The model has a crs: "This data only" by default, the other data stay
    await expect(window.getByTestId("crsAlignScope-one").locator("input")).toBeChecked();
    await fillAlignment(window, ALIGN_SOURCE, ALIGN_TARGET, LAMBERT_93);
    await applyAlignment(window);
    await expectTreeCrs(window, brepGeodeObjectType, BREP_NAME, "EPSG:32631");
    await moveMouseOutOfTheWay(window);
  });

  test("no data is flagged once every data follows the project", async ({ window }) => {
    await expectCrsMismatch(window, brepGeodeObjectType, BREP_NAME, false);
    await expectCrsMismatch(window, pointSetGeodeObjectType, POINTSET_NAME, false);
    await moveMouseOutOfTheWay(window);
  });

  test("open the crs dialog from the object tree", async ({ window }) => {
    await openCrsFromTree(window, pointSetGeodeObjectType, POINTSET_NAME);
    await expectCurrentCrs(window, "EPSG:32631");
  });

  test("close the crs dialog opened from the object tree", async ({ window }) => {
    await closeCrsDialog(window);
  });

  test("open the crs dialog from the info card", async ({ window }) => {
    await openCrsFromInfoCard(window, pointSetGeodeObjectType, POINTSET_NAME);
    await expectCurrentCrs(window, "EPSG:32631");
  });

  test("close the crs dialog opened from the info card", async ({ window }) => {
    await closeCrsDialog(window);
  });

  test("convert the model alone", async ({ window }) => {
    await convertAloneTo(window, brepGeodeObjectType, BREP_NAME, LAMBERT_93);
    await expectTreeCrs(window, brepGeodeObjectType, BREP_NAME, "EPSG:2154");
    await expectTreeCrs(window, edgedCurveGeodeObjectType, CURVE_NAME, "EPSG:32631");
    await moveMouseOutOfTheWay(window);
  });

  test("the model out of the project crs is flagged in the tree", async ({ window }) => {
    await expectCrsMismatch(window, brepGeodeObjectType, BREP_NAME, true);
    await moveMouseOutOfTheWay(window);
  });

  test("the warning opens the crs dialog of the model", async ({ window }) => {
    await openCrsFromWarning(window, brepGeodeObjectType, BREP_NAME);
    await expectCurrentCrs(window, "EPSG:2154");
    await closeCrsDialog(window);
  });

  test("open the project crs from the scene", async ({ window }) => {
    await openProjectCrs(window);
    // The tooltip of the project crs button would stay under the mouse
    await moveMouseOutOfTheWay(window);
  });

  // The model is in Lambert-93, the others in UTM 31N: a Lambert-93 project moves the others
  test("change the project crs", async ({ window }) => {
    await selectCrs(window, LAMBERT_93);
    await confirmProjectCrs(window);
    await moveMouseOutOfTheWay(window);
    await expectCrsMismatch(window, pointSetGeodeObjectType, POINTSET_NAME, false);
  });

  test("every data is in the project crs", async ({ window }) => {
    await expectEveryRowCrs(window, "EPSG:2154");
    await moveMouseOutOfTheWay(window);
  });

  // Every data is in Lambert-93. Their coordinates are local numbers: they do not fit CC42
  test("relabeling a georeferenced data with a misfit crs asks first", async ({ window }) => {
    await startMisfitAssign(window, brepGeodeObjectType, BREP_NAME, CC42);
    await expect(window.getByTestId("crsAssignMismatch")).toContainText("Did you mean Convert?");
  });

  test("convert instead switches to convert", async ({ window }) => {
    await window.getByTestId("crsConvertInstead").click();
    await waitForActionSettled(window);
    await expect(window.getByTestId("crsConvertButton")).toBeVisible();
  });

  test("assign anyway to all data", async ({ window }) => {
    await assignAnywayToAll(window, CC42);
    // Every data was in Lambert-93: all relabeled together
    await expectEveryRowCrs(window, "EPSG:3942");
    await moveMouseOutOfTheWay(window);
  });
}

export { registerTests };
