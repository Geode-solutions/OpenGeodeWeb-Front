// Third party imports
import { type Locator, type Page, expect } from "@playwright/test";

// Local imports
import { closeFeedbackSnackbar, moveMouseOutOfTheWay } from "./app_interaction";
import { expandGeodeObjectTypeInTree, getTreeRowByTextAndParent } from "./object_trees/common";
import { getMainObjectTree } from "./object_trees/main_object_tree";
import { waitForActionSettled } from "./wait_for_action_settled";

const TOOLTIP_TIMEOUT_MS = 2000;
const TOOLTIP_HOVER_ATTEMPTS = 3;

async function getDataTreeRow(
  window: Page,
  geodeObjectType: string,
  dataName: string,
): Promise<Locator> {
  const tree = getMainObjectTree(window);
  await expandGeodeObjectTypeInTree(window, geodeObjectType, tree);
  return getTreeRowByTextAndParent(window, geodeObjectType, dataName, tree);
}

// The tooltip opens on mouseenter: a hover landing while the tree re-renders misses it, so it is retried from
// Outside the row
async function hoverTreeRowTooltip(window: Page, row: Locator, target: Locator): Promise<void> {
  // Each attempt waits for the previous hover: they must run one after another
  // oxlint-disable no-await-in-loop
  for (let attempt = 1; attempt <= TOOLTIP_HOVER_ATTEMPTS; attempt += 1) {
    await moveMouseOutOfTheWay(window);
    await row.getByTestId("treeItemLabel").first().hover();
    const shown = await target
      .waitFor({ state: "visible", timeout: TOOLTIP_TIMEOUT_MS })
      .then(() => true)
      .catch(() => false);
    if (shown) {
      return;
    }
  }
  // oxlint-enable no-await-in-loop
  throw new Error(`The tree tooltip did not open after ${TOOLTIP_HOVER_ATTEMPTS} hovers`);
}

async function openCrsFromTree(
  window: Page,
  geodeObjectType: string,
  dataName: string,
): Promise<void> {
  const row = await getDataTreeRow(window, geodeObjectType, dataName);
  const editButton = window.locator(".v-overlay--active").getByTestId("editCrsBtn");
  await hoverTreeRowTooltip(window, row, editButton);
  await editButton.click();
  await waitForActionSettled(window);
}

// The tooltip of the tree row shows the crs of the data
async function expectTreeCrs(
  window: Page,
  geodeObjectType: string,
  dataName: string,
  expected: string,
): Promise<void> {
  const row = await getDataTreeRow(window, geodeObjectType, dataName);
  const crsValue = window.locator(".v-overlay--active").getByTestId("tooltipCrsValue");
  await hoverTreeRowTooltip(window, row, crsValue);
  await expect(crsValue).toContainText(expected);
}

async function openCrsFromInfoCard(
  window: Page,
  geodeObjectType: string,
  dataName: string,
): Promise<void> {
  const row = await getDataTreeRow(window, geodeObjectType, dataName);
  await row.click({ button: "right" });
  await waitForActionSettled(window);
  await window.getByTestId("circularMenuCenterButton").click();
  await window.getByTestId("infoEditCrsBtn").click();
  await waitForActionSettled(window);
}

// The warning icon of the tree opens the crs dialog of the data
async function openCrsFromWarning(
  window: Page,
  geodeObjectType: string,
  dataName: string,
): Promise<void> {
  const row = await getDataTreeRow(window, geodeObjectType, dataName);
  await row.getByTestId("crsMismatchIcon").click();
  await waitForActionSettled(window);
}

async function openCrsFromFeedback(window: Page, text: string): Promise<void> {
  const snackbar = window.getByTestId("feedbackSnackbar").filter({ hasText: text });
  await expect(snackbar).toBeVisible();
  await snackbar.getByTestId("feedbackActionBtn").click();
  await waitForActionSettled(window);
}

// Selecting is its own step so the dialog state is captured before the action
async function selectCrs(window: Page, crsName: string): Promise<void> {
  await window.getByTestId("crsSearchInput").locator("input").fill(crsName);
  // A click on the row selects it: the list has no checkbox column
  await window.locator("tbody tr").filter({ hasText: crsName }).first().click();
  await waitForActionSettled(window);
}

async function confirmAssign(window: Page): Promise<void> {
  await window.getByTestId("crsAssignButton").click();
  await waitForActionSettled(window);
  // The global feedback snackbar outlives the next step: close it so screenshots stay stable
  await closeFeedbackSnackbar(window);
}

async function expectCurrentCrs(window: Page, expected: string): Promise<void> {
  await expect(window.getByTestId("crsCurrentValue")).toContainText(expected);
}

// A georeferenced data opens on convert
async function selectAssignMode(window: Page): Promise<void> {
  await window.getByTestId("crsModeAssign").click();
  await waitForActionSettled(window);
}

// Without closing the feedback: the step checks the dialog or the warning it shows
async function clickAssign(window: Page): Promise<void> {
  await window.getByTestId("crsAssignButton").click();
  await waitForActionSettled(window);
}

// The snackbar leaves after 10s: a slow basemap build (external tile servers) can outlast it while the action
// Settles, so it is watched from before the action
const FEEDBACK_TIMEOUT_MS = 60_000;

async function expectFeedback(
  window: Page,
  text: string,
  action: () => Promise<void>,
): Promise<void> {
  const shown = window
    .getByTestId("feedbackSnackbar")
    .filter({ hasText: text })
    // Several builds can fail with the same message (e.g. one per aligned data): any of them will do
    .first()
    .waitFor({ state: "visible", timeout: FEEDBACK_TIMEOUT_MS });
  await Promise.all([shown, action()]);
  await closeFeedbackSnackbar(window);
}

async function selectConvertMode(window: Page): Promise<void> {
  await window.getByTestId("crsModeConvert").click();
  await waitForActionSettled(window);
}

async function confirmConvert(window: Page): Promise<void> {
  await window.getByTestId("crsConvertButton").click();
  await waitForActionSettled(window);
  await closeFeedbackSnackbar(window);
}

async function startAlignment(window: Page): Promise<void> {
  await window.getByTestId("crsModeAlign").click();
  await window.getByTestId("crsStartAlignButton").click();
  await waitForActionSettled(window);
  // The mouse left on the button would open its tooltip over the panel
  await moveMouseOutOfTheWay(window);
}

async function fillAlignPoints(
  window: Page,
  prefix: "crsAlignSource" | "crsAlignTarget",
  points: { x: number; y: number }[],
): Promise<void> {
  // Fills share the keyboard focus: they must run one after another
  // oxlint-disable no-await-in-loop
  for (const [index, { x, y }] of points.entries()) {
    const inputs = window.getByTestId(`${prefix}-${index}`).locator("input");
    await inputs.nth(0).fill(String(x));
    await inputs.nth(1).fill(String(y));
  }
  // oxlint-enable no-await-in-loop
}

async function selectAlignmentCrs(window: Page, crsName: string): Promise<void> {
  const panel = window.getByTestId("crsAlignPanel");
  await panel.getByTestId("crsSearchInput").locator("input").fill(crsName);
  await panel.locator("tbody tr").filter({ hasText: crsName }).first().click();
  await waitForActionSettled(window);
}

// "All data" or "This data only", in the crs dialog (crsScope) or the align panel (crsAlignScope)
async function selectScope(
  window: Page,
  scope: "all" | "one",
  testId: "crsScope" | "crsAlignScope" = "crsScope",
): Promise<void> {
  await window.getByTestId(`${testId}-${scope}`).locator("input").check();
  await waitForActionSettled(window);
}

async function expectCrsMismatch(
  window: Page,
  geodeObjectType: string,
  dataName: string,
  expected: boolean,
): Promise<void> {
  const row = await getDataTreeRow(window, geodeObjectType, dataName);
  // The icon only exists on a mismatched data
  await expect(row.getByTestId("crsMismatchIcon")).toHaveCount(expected ? 1 : 0);
}

async function openProjectCrs(window: Page): Promise<void> {
  await window.getByTestId("projectCrs").click();
  await waitForActionSettled(window);
}

async function confirmProjectCrs(window: Page): Promise<void> {
  await window.getByTestId("projectCrsApply").click();
  await waitForActionSettled(window);
  await closeFeedbackSnackbar(window);
}

async function applyAlignment(window: Page): Promise<void> {
  await window.getByTestId("crsAlignApplyButton").click();
  await waitForActionSettled(window);
  await closeFeedbackSnackbar(window);
}

export {
  applyAlignment,
  clickAssign,
  confirmAssign,
  confirmConvert,
  confirmProjectCrs,
  expectCrsMismatch,
  expectCurrentCrs,
  expectFeedback,
  expectTreeCrs,
  fillAlignPoints,
  openCrsFromFeedback,
  openCrsFromInfoCard,
  openCrsFromTree,
  openCrsFromWarning,
  openProjectCrs,
  selectAlignmentCrs,
  selectAssignMode,
  selectConvertMode,
  selectCrs,
  selectScope,
  startAlignment,
};
