// Node imports

// Third party imports
import { type Locator, type Page, expect } from "@playwright/test";

// Local imports
import { brepGeodeObjectType, defaultDataName } from "#browser_helpers/constants";
import {
  expandMeshComponentType,
  getModelComponentsObjectTree,
  openModelComponentsTree,
} from "#browser_helpers/object_trees/model_components_object_tree";
import { expandMainObjectTree } from "#browser_helpers/object_trees/main_object_tree";
import { moveMouseOutOfTheWay } from "#browser_helpers/viewer_interaction";
import { waitForActionSettled } from "#browser_helpers/wait_for_action_settled";

import type { SuiteRuntime } from "#browser_helpers/suite_runtime";

// Constants
const brepFilename = "test.og_brep";
const SURFACE_BOUNDARIES = 4;

function treeRows(window: Page): Locator {
  return getModelComponentsObjectTree(window).getByTestId("treeRowWrapper");
}

// The first component of the opened type that has relations: its row can be expanded
function firstExpandableComponentRow(window: Page): Locator {
  return getModelComponentsObjectTree(window)
    .locator(".leaf-row")
    .filter({ has: window.getByTestId("expandTreeRowButton") })
    .first();
}

async function expandRow(window: Page, row: Locator): Promise<void> {
  await row.getByTestId("expandTreeRowButton").first().click();
  await moveMouseOutOfTheWay(window);
  await waitForActionSettled(window);
}

// Shared with the apps built on this layer: each one runs it with its own test fixture and data loader
function registerTests({ test, loadTestDatas }: SuiteRuntime): void {
  test.describe.configure({ mode: "serial" });

  test("load brep and open model components", async ({ window }) => {
    await loadTestDatas(window, [brepFilename]);
    await expandMainObjectTree(window);
    await openModelComponentsTree(window, brepGeodeObjectType, defaultDataName);
  });

  test("expand surfaces", async ({ window }) => {
    await expandMeshComponentType(window, "Surfaces");
    await expect(firstExpandableComponentRow(window)).toBeVisible();
    await expect(treeRows(window).filter({ hasText: "Boundaries (" })).toHaveCount(0);
  });

  test("expand a surface shows its boundaries", async ({ window }) => {
    await expandRow(window, firstExpandableComponentRow(window));
    await expect(treeRows(window).filter({ hasText: "Boundaries (" })).toHaveCount(1);
    await expect(
      treeRows(window).filter({ hasText: `Boundaries (${SURFACE_BOUNDARIES})` }),
    ).toHaveCount(1);
  });

  // The viewer highlights the lines of the group, not the surface
  test("hover the boundaries of a surface highlights its lines", async ({ window }) => {
    await treeRows(window).filter({ hasText: "Boundaries (" }).first().hover();
    await waitForActionSettled(window);
  });

  test("expand the boundaries of a surface lists its lines", async ({ window }) => {
    const rowsBefore = await treeRows(window).count();
    await expandRow(window, treeRows(window).filter({ hasText: "Boundaries (" }).first());
    await expect(treeRows(window)).toHaveCount(rowsBefore + SURFACE_BOUNDARIES);
  });
}

export { registerTests };
