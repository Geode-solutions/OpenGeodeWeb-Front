// Third party imports
import { expect } from "@playwright/test";

// Local imports
import {
  brepGeodeObjectType,
  defaultDataName,
  structuralModelGeodeObjectType,
} from "#browser_helpers/constants";
import {
  clickModelTreeBarButton,
  dragModelTreeButton,
  getModelTreeButtonColors,
  getModelTreePanelColors,
  getModelTreeRows,
  getModelTreeToggles,
} from "#browser_helpers/object_trees/model_tree_bar";
import {
  collapseMainObjectTreeGroup,
  expandMainObjectTree,
  getMainObjectTree,
} from "#browser_helpers/object_trees/main_object_tree";
import {
  expandMeshComponentType,
  getModelComponentsObjectTree,
  openModelComponentsTree,
} from "#browser_helpers/object_trees/model_components_object_tree";
import { fillSearchQuery } from "#browser_helpers/object_trees/common";
import { moveMouseOutOfTheWay } from "#browser_helpers/app_interaction";

import type { SuiteRuntime } from "#browser_helpers/suite_runtime";

// Constants
const brepFilename = "test.og_brep";
const structuralModelFilename = "test.og_strm";

// Shared with the apps built on this layer: each one runs it with its own test fixture and data loader
function registerTests({ test, loadTestDatas }: SuiteRuntime): void {
  test.describe.configure({ mode: "serial" });

  let surfaceRows = 0;

  test("open a model tree with its surfaces expanded", async ({ window }) => {
    test.slow();
    await loadTestDatas(window, [brepFilename]);
    await loadTestDatas(window, [structuralModelFilename]);
    await expandMainObjectTree(window);
    await openModelComponentsTree(window, brepGeodeObjectType, defaultDataName);
    await expandMeshComponentType(window, "Surfaces");
    await moveMouseOutOfTheWay(window);
    surfaceRows = await getModelTreeRows(window).count();
    await expect(getModelTreeToggles(window)).toHaveCount(1);
  });

  test("collapse the model tree from its button", async ({ window }) => {
    await clickModelTreeBarButton(window, window.getByTestId("toggleModelTreeButton"));
    await expect(getModelComponentsObjectTree(window)).toHaveCount(0);
    await expect(getModelTreeToggles(window)).toHaveCount(1);
  });

  test("show the model tree again with its state", async ({ window }) => {
    await clickModelTreeBarButton(window, window.getByTestId("toggleModelTreeButton"));
    await expect(getModelComponentsObjectTree(window)).toHaveCount(1);
    await expect(getModelTreeRows(window)).toHaveCount(surfaceRows);
  });

  test("open a second model tree", async ({ window }) => {
    await openModelComponentsTree(window, structuralModelGeodeObjectType, defaultDataName);
    await expect(getModelComponentsObjectTree(window)).toHaveCount(2);
    await expect(window.getByTestId("toggleAllModelTreesButton")).toBeVisible();
  });

  test("collapse all the model trees", async ({ window }) => {
    await clickModelTreeBarButton(window, window.getByTestId("toggleAllModelTreesButton"));
    await expect(getModelComponentsObjectTree(window)).toHaveCount(0);
  });

  test("show all the model trees", async ({ window }) => {
    await clickModelTreeBarButton(window, window.getByTestId("toggleAllModelTreesButton"));
    await expect(getModelComponentsObjectTree(window)).toHaveCount(2);
  });

  test("reorder the model trees from their buttons", async ({ window }) => {
    const before = await getModelTreePanelColors(window);
    await dragModelTreeButton(window, 1, 0);
    await expect
      .poll(async () => {
        const colors = await getModelTreePanelColors(window);
        return colors;
      })
      .toStrictEqual(before.toReversed());
    expect(await getModelTreeButtonColors(window)).toStrictEqual(before.toReversed());
  });

  test("the search takes the keyboard as it opens", async ({ window }) => {
    const mainObjectTree = getMainObjectTree(window);
    await collapseMainObjectTreeGroup(window, brepGeodeObjectType);
    await mainObjectTree.getByTestId("searchObjectsButton").click();
    for (const key of ["t", "e", "s"]) {
      // oxlint-disable-next-line no-await-in-loop -- one key after the other
      await window.keyboard.press(key);
    }
    await expect(mainObjectTree.getByTestId("searchObjectsInput").locator("input")).toHaveValue(
      "tes",
    );
  });

  test("clearing the search folds the groups back", async ({ window }) => {
    const mainObjectTree = getMainObjectTree(window);
    await fillSearchQuery(window, "", mainObjectTree);
    await expect(
      mainObjectTree.getByTestId("treeRowWrapper").filter({ hasText: defaultDataName }),
    ).toHaveCount(1);
  });

  test("leaving an empty search folds it back", async ({ window }) => {
    const searchInput = getMainObjectTree(window)
      .getByTestId("searchObjectsInput")
      .locator("input");
    await searchInput.blur();
    await expect(searchInput).toBeHidden();
  });
}

export { registerTests };
