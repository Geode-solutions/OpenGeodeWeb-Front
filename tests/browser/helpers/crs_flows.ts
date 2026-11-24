// Third party imports
import type { Page } from "@playwright/test";

// Local imports
import { BREP_NAME, CURVE_NAME, POINTSET_NAME } from "./crs_test_data";
import {
  brepGeodeObjectType,
  edgedCurveGeodeObjectType,
  pointSetGeodeObjectType,
} from "./constants";
import {
  clickAssign,
  confirmConvert,
  expectTreeCrs,
  fillAlignPoints,
  openCrsFromTree,
  selectAlignmentCrs,
  selectAssignMode,
  selectConvertMode,
  selectCrs,
  selectScope,
} from "./crs";
import { closeFeedbackSnackbar, moveMouseOutOfTheWay } from "./app_interaction";
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

export {
  assignAnywayToAll,
  closeCrsDialog,
  convertAloneTo,
  expectEveryRowCrs,
  fillAlignment,
  startMisfitAssign,
};
