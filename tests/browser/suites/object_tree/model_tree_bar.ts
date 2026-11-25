// Third party imports
import { type Locator, type Page, expect } from "@playwright/test";

// Local imports
import {
  brepGeodeObjectType,
  defaultDataName,
  structuralModelGeodeObjectType,
} from "#browser_helpers/constants";
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
import { waitForActionSettled } from "#browser_helpers/wait_for_action_settled";

import type { SuiteRuntime } from "#browser_helpers/suite_runtime";

// Constants
const brepFilename = "test.og_brep";
const structuralModelFilename = "test.og_strm";
const DRAG_STEPS = 10;

function getModelTreeToggles(window: Page): Locator {
  return window.getByTestId("modelTreeToggle");
}

function getModelTreeRows(window: Page): Locator {
  return getModelComponentsObjectTree(window).getByTestId("treeRowWrapper");
}

async function clickAndSettle(window: Page, locator: Locator): Promise<void> {
  await locator.click();
  await moveMouseOutOfTheWay(window);
  await waitForActionSettled(window);
}

// The colors of the model trees, in the order of their panels and of their buttons in the activity bar
async function panelColors(window: Page): Promise<string[]> {
  const colors = await window.locator(".tree-box").evaluateAll((boxes) =>
    boxes
      .map((box) => {
        if (box instanceof HTMLElement) {
          return box.style.getPropertyValue("--tree-box-accent");
        }
        return "";
      })
      .filter((color) => color !== ""),
  );
  return colors;
}

async function buttonColors(window: Page): Promise<string[]> {
  const colors = await getModelTreeToggles(window).evaluateAll((toggles) =>
    toggles.map((toggle) => {
      if (toggle instanceof HTMLElement) {
        return toggle.style.getPropertyValue("--model-tree-color");
      }
      return "";
    }),
  );
  return colors;
}

// Drags a model button over another one with the mouse, as the native drag and drop needs
async function dragModelButton(window: Page, fromIndex: number, toIndex: number): Promise<void> {
  const source = await getModelTreeToggles(window).nth(fromIndex).boundingBox();
  const target = await getModelTreeToggles(window).nth(toIndex).boundingBox();
  if (source === null || target === null) {
    throw new Error("The model buttons are not displayed.");
  }
  await window.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
  await window.mouse.down();
  await window.mouse.move(target.x + target.width / 2, target.y + target.height / 2, {
    steps: DRAG_STEPS,
  });
  await window.mouse.up();
  await moveMouseOutOfTheWay(window);
  await waitForActionSettled(window);
}

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
    await clickAndSettle(window, window.getByTestId("toggleModelTreeButton"));
    await expect(getModelComponentsObjectTree(window)).toHaveCount(0);
    await expect(getModelTreeToggles(window)).toHaveCount(1);
  });

  test("show the model tree again with its state", async ({ window }) => {
    await clickAndSettle(window, window.getByTestId("toggleModelTreeButton"));
    await expect(getModelComponentsObjectTree(window)).toHaveCount(1);
    await expect(getModelTreeRows(window)).toHaveCount(surfaceRows);
  });

  test("open a second model tree", async ({ window }) => {
    await openModelComponentsTree(window, structuralModelGeodeObjectType, defaultDataName);
    await expect(getModelComponentsObjectTree(window)).toHaveCount(2);
    await expect(window.getByTestId("toggleAllModelTreesButton")).toBeVisible();
  });

  test("collapse all the model trees", async ({ window }) => {
    await clickAndSettle(window, window.getByTestId("toggleAllModelTreesButton"));
    await expect(getModelComponentsObjectTree(window)).toHaveCount(0);
  });

  test("show all the model trees", async ({ window }) => {
    await clickAndSettle(window, window.getByTestId("toggleAllModelTreesButton"));
    await expect(getModelComponentsObjectTree(window)).toHaveCount(2);
  });

  test("reorder the model trees from their buttons", async ({ window }) => {
    const before = await panelColors(window);
    await dragModelButton(window, 1, 0);
    await expect
      .poll(async () => {
        const colors = await panelColors(window);
        return colors;
      })
      .toStrictEqual(before.toReversed());
    expect(await buttonColors(window)).toStrictEqual(before.toReversed());
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
