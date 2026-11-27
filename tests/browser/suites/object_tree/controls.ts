// Node imports

// Third party imports
import { expect } from "@playwright/test";

// Local imports
import {
  checkFilterCategory,
  copyTreeRowId,
  expandGeodeObjectTypeInTree,
  fillSearchQuery,
  getTreeRowId,
  hideObjectInTree,
  openFilterMenu,
  toggleSearchObjects,
  toggleSortObjects,
  uncheckFilterCategory,
} from "#browser_helpers/object_trees/common";
import {
  collapseMainObjectTree,
  getMainObjectTree,
  toggleObjectsTree,
} from "#browser_helpers/object_trees/main_object_tree";
import {
  collapseModelComponentsObjectTree,
  expandModelComponentsObjectTree,
  getModelComponentsObjectTree,
  openModelComponentsTree,
  setModelTreeRowColorRandom,
} from "#browser_helpers/object_trees/model_components_object_tree";
import { assertDefined } from "#browser_helpers/other";
import { brepGeodeObjectType } from "#browser_helpers/constants";
import { closeAllMenus } from "#browser_helpers/app_interaction";
import { moveMouseOutOfTheWay } from "#browser_helpers/viewer_interaction";
import { resetCamera } from "#browser_helpers/camera_interaction";
import { waitForActionSettled } from "#browser_helpers/wait_for_action_settled";

import type { SuiteRuntime } from "#browser_helpers/suite_runtime";

// Constants
const brepFilename = "test.og_brep";
const edc3dFilename = "test.og_edc3d";
const psf3dFilename = "test.og_psf3d";
const hso3dFilename = "test.og_hso3d";

let surfaceId: string | undefined = undefined;

// Shared with the apps built on this layer: each one runs it with its own test fixture and data loader
function registerTests({ test, loadTestDatas }: SuiteRuntime): void {
  test.describe.configure({ mode: "serial" });

  test("load all files", async ({ window }) => {
    test.slow();
    await loadTestDatas(window, [brepFilename]);
    await loadTestDatas(window, [edc3dFilename]);
    await loadTestDatas(window, [psf3dFilename]);
    await loadTestDatas(window, [hso3dFilename]);
  });

  test("reset camera", async ({ window }) => {
    await resetCamera(window);
  });

  test("filter objects", async ({ window }) => {
    await openFilterMenu(window, getMainObjectTree(window));
    await uncheckFilterCategory(window, "EdgedCurve3D");
    await uncheckFilterCategory(window, "PolygonalSurface3D");
  });

  test("sort by id", async ({ window }) => {
    await closeAllMenus(window);
    await toggleSortObjects(window);
  });

  test("sort by name", async ({ window }) => {
    await toggleSortObjects(window);
  });

  test("hide HybridSolid3D objects", async ({ window }) => {
    await hideObjectInTree(window, "HybridSolid3D", undefined, getMainObjectTree(window));
  });

  test("search by text", async ({ window }) => {
    await toggleSearchObjects(window);
    await fillSearchQuery(window, "test", getMainObjectTree(window));

    await fillSearchQuery(window, "", getMainObjectTree(window));
  });

  test("search by id", async ({ window, screenshotMask }) => {
    const mainObjectTree = getMainObjectTree(window);
    // Clearing the search folded the groups back as they were before it
    await expandGeodeObjectTypeInTree(window, brepGeodeObjectType, mainObjectTree);
    const brepLabel = mainObjectTree
      .locator('[data-testid^="treeRow-"]', { hasText: "test" })
      .first();
    const brepId = await getTreeRowId(brepLabel, "test");
    const searchPrefix = brepId.slice(0, 3);
    await fillSearchQuery(window, searchPrefix, mainObjectTree);
    screenshotMask.locators = [window.getByTestId("searchObjectsInput")];
  });

  test("refilter object", async ({ window }) => {
    const mainObjectTree = getMainObjectTree(window);
    await fillSearchQuery(window, "", mainObjectTree);
    await openFilterMenu(window, mainObjectTree);
    await checkFilterCategory(window, "PolygonalSurface3D");
  });

  test("collapse main object tree", async ({ window }) => {
    await closeAllMenus(window);
    await openModelComponentsTree(window, brepGeodeObjectType, "test");
    await collapseMainObjectTree(window);
  });

  test("toggle objects", async ({ window }) => {
    await toggleObjectsTree(window);
  });

  test("expand model components", async ({ window }) => {
    await expandModelComponentsObjectTree(window);
  });

  test("hide model blocks", async ({ window }) => {
    await hideObjectInTree(window, "Blocks", undefined, getModelComponentsObjectTree(window));
  });

  test("filter model components", async ({ window }) => {
    const modelComponentsObjectTree = getModelComponentsObjectTree(window);
    await modelComponentsObjectTree.getByTestId("filterObjectsButton").click();
    await waitForActionSettled(window);
    await window.getByTestId("filterCheckbox-Blocks").getByRole("checkbox").uncheck();
    await waitForActionSettled(window);
    await window.getByTestId("filterCheckbox-Lines").getByRole("checkbox").uncheck();
  });

  test("sort model components by id", async ({ window }) => {
    await closeAllMenus(window);
    const modelComponentsObjectTree = getModelComponentsObjectTree(window);
    await modelComponentsObjectTree.getByTestId("sortObjectsButton").click();
    await waitForActionSettled(window);
    await moveMouseOutOfTheWay(window);
  });

  test("sort model components by name", async ({ window }) => {
    const modelComponentsObjectTree = getModelComponentsObjectTree(window);
    await modelComponentsObjectTree.getByTestId("sortObjectsButton").click();
  });

  test("search model components by text", async ({ window }) => {
    const modelComponentsObjectTree = getModelComponentsObjectTree(window);
    await modelComponentsObjectTree.getByTestId("searchObjectsButton").click();
    await waitForActionSettled(window);
    const searchInput = modelComponentsObjectTree
      .getByTestId("searchObjectsInput")
      .locator("input");
    await searchInput.fill("ff");
  });

  test("hide filtered corners", async ({ window }) => {
    await hideObjectInTree(window, "Corners", undefined, getModelComponentsObjectTree(window));
  });

  test("color filtered surfaces", async ({ window }) => {
    await setModelTreeRowColorRandom(window, "Surfaces");
  });

  test("clear model components searchbar", async ({ window }) => {
    await window.keyboard.press("Escape");
    await fillSearchQuery(window, "", getModelComponentsObjectTree(window));
  });

  test("copy surface id", async ({ window }) => {
    surfaceId = await copyTreeRowId(
      window,
      "Surfaces",
      "00000000-",
      getModelComponentsObjectTree(window),
    );
    expect(surfaceId).toBeTruthy();
  });

  test("search by copied surface id", async ({ window, screenshotMask }) => {
    const id = assertDefined(surfaceId, "surfaceId was not set by the previous test.");
    await fillSearchQuery(window, id, getModelComponentsObjectTree(window));
    screenshotMask.locators = [
      window.getByTestId("modelComponentsObjectTree").getByTestId("searchObjectsInput"),
    ];
  });

  test("collapse all model components", async ({ window }) => {
    await fillSearchQuery(window, "", getModelComponentsObjectTree(window));
    await collapseModelComponentsObjectTree(window);
  });
}

export { registerTests };
