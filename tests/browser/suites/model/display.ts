// Node imports

// Third party imports
import { consola } from "consola";

// Local imports
import { brepGeodeObjectType, defaultDataName } from "#browser_helpers/constants";
import {
  expandGeodeObjectType,
  expandMainObjectTree,
  getMainObjectTree,
  highlightData,
} from "#browser_helpers/object_trees/main_object_tree";
import {
  setModelColorWithSlider,
  setModelColoringStyle,
  setModelComponentsPointsSize,
  setModelEdgesVisibility,
  setModelOpacity,
  setModelPointsVisibility,
} from "#browser_helpers/data/index";
import { toggleInfoCard, viewerContextMenu } from "#browser_helpers/viewer_interaction";

import type { SuiteRuntime } from "#browser_helpers/suite_runtime";

// Constants
const brepFilename = "test.og_brep";
const modelOpacity = 50;
const pointsSize = 15;

// Shared with the apps built on this layer: each one runs it with its own test fixture and data loader
function registerTests({ test, loadTestDatas }: SuiteRuntime): void {
  test.describe.configure({ mode: "serial" });

  test("load brep", async ({ window }) => {
    await loadTestDatas(window, [brepFilename]);
    await expandMainObjectTree(window);
  });

  test("highlight", async ({ window, screenshotMask }) => {
    await highlightData(window, brepGeodeObjectType, defaultDataName);
    screenshotMask.locators = [window.getByTestId("tooltipIdValue")];
  });

  test("viewer context menu", async ({ window }) => {
    const x = 549;
    const y = 360;
    await viewerContextMenu(window, x, y);
  });

  test("info card", async ({ window }) => {
    await toggleInfoCard(window);
  });

  test("points visibility", async ({ window }) => {
    await toggleInfoCard(window);
    await setModelPointsVisibility(window, true);
  });

  test("points size", async ({ window }) => {
    await setModelComponentsPointsSize(window, "modelPointsComponentTypeOptions", pointsSize);
  });

  test("model color", async ({ window }) => {
    await setModelColorWithSlider(window);
  });

  test("model opacity", async ({ window }) => {
    await setModelOpacity(window, modelOpacity);
  });

  test("random coloring", async ({ window }) => {
    await setModelColoringStyle(window, "Random");
  });

  test("object tree context menu", async ({ window }) => {
    consola.info("Right click on the BRep from object tree");
    await expandGeodeObjectType(window, "BRep");
    const mainObjectTree = getMainObjectTree(window);
    const testItem = mainObjectTree.getByText("test", { exact: true }).first();
    await testItem.click({ button: "right", force: true });
  });

  test("edges visibility", async ({ window }) => {
    await setModelEdgesVisibility(window, true);
  });
}

export { registerTests };
