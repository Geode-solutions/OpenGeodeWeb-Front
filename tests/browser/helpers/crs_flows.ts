// Third party imports
import { type Page, expect } from "@playwright/test";

// Local imports
import { BREP_NAME, CURVE_NAME, POINTSET_NAME } from "./crs_test_data";
import {
  applyAlignment,
  clickAssign,
  confirmConvert,
  expectFeedback,
  expectTreeCrs,
  fillAlignPoints,
  openCrsFromTree,
  selectAlignmentCrs,
  selectAssignMode,
  selectConvertMode,
  selectCrs,
  selectScope,
} from "./crs";
import {
  brepGeodeObjectType,
  edgedCurveGeodeObjectType,
  pointSetGeodeObjectType,
} from "./constants";
import { closeFeedbackSnackbar, moveMouseOutOfTheWay } from "./app_interaction";
import { getMainObjectTree } from "./object_trees/main_object_tree";
import { waitForActionSettled } from "./wait_for_action_settled";

async function closeCrsDialog(window: Page): Promise<void> {
  await window.keyboard.press("Escape");
  await moveMouseOutOfTheWay(window);
}

// The point set, the model and the curve of the crs suite
async function expectEveryRowCrs(window: Page, expected: string): Promise<void> {
  await expectTreeCrs(window, pointSetGeodeObjectType, POINTSET_NAME, expected);
  await expectTreeCrs(window, brepGeodeObjectType, BREP_NAME, expected);
  await expectTreeCrs(window, edgedCurveGeodeObjectType, CURVE_NAME, expected);
}

async function fillAlignment(
  window: Page,
  source: { x: number; y: number }[],
  target: { x: number; y: number }[],
  crsName: string,
): Promise<void> {
  await fillAlignPoints(window, "crsAlignSource", source);
  await fillAlignPoints(window, "crsAlignTarget", target);
  await selectAlignmentCrs(window, crsName);
  await moveMouseOutOfTheWay(window);
}

async function convertAloneTo(
  window: Page,
  geodeObjectType: string,
  dataName: string,
  crsName: string,
): Promise<void> {
  await openCrsFromTree(window, geodeObjectType, dataName);
  await selectConvertMode(window);
  await selectScope(window, "one");
  await selectCrs(window, crsName);
  await confirmConvert(window);
  await moveMouseOutOfTheWay(window);
}

async function startMisfitAssign(
  window: Page,
  geodeObjectType: string,
  dataName: string,
  crsName: string,
): Promise<void> {
  await openCrsFromTree(window, geodeObjectType, dataName);
  await selectAssignMode(window);
  await selectCrs(window, crsName);
  await clickAssign(window);
}

async function assignAnywayToAll(window: Page, crsName: string): Promise<void> {
  await selectAssignMode(window);
  await selectScope(window, "all");
  await selectCrs(window, crsName);
  await clickAssign(window);
  await window.getByTestId("crsAssignAnyway").click();
  await waitForActionSettled(window);
  await closeFeedbackSnackbar(window);
  await moveMouseOutOfTheWay(window);
}

// With a basemap (only in the apps that opt in), an alignment moving the data out of the domain of the project CRS
// Makes the basemap build fail: its message shows and the basemap is hidden. Without one, nothing else happens
async function applyAlignmentOffTheMap(window: Page): Promise<void> {
  const basemapRow = getMainObjectTree(window)
    .getByTestId("treeRowWrapper")
    .filter({ hasText: "Basemap" });
  if ((await basemapRow.count()) === 0) {
    await applyAlignment(window);
    return;
  }
  await expectFeedback(window, "Area outside the map projection limits", async () => {
    await applyAlignment(window);
  });
  // Only the last build hides the basemap: no other message comes after
  await expect(basemapRow.getByTestId("hiddenObjectEyeButton")).toBeVisible();
}

export {
  applyAlignmentOffTheMap,
  assignAnywayToAll,
  closeCrsDialog,
  convertAloneTo,
  expectEveryRowCrs,
  fillAlignment,
  startMisfitAssign,
};
