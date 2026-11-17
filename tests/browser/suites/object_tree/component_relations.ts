// Node imports

// Third party imports
import { expect } from "@playwright/test";

// Local imports
import { brepGeodeObjectType, defaultDataName } from "#browser_helpers/constants";
import {
  expandMeshComponentType,
  openModelComponentsTree,
} from "#browser_helpers/object_trees/model_components_object_tree";
import {
  expandModelComponentRow,
  getFirstExpandableModelComponentRow,
  getModelComponentBoundariesRows,
  getModelComponentsTreeRows,
} from "#browser_helpers/object_trees/model_component_relations";
import { expandMainObjectTree } from "#browser_helpers/object_trees/main_object_tree";
import { waitForActionSettled } from "#browser_helpers/wait_for_action_settled";

import type { SuiteRuntime } from "#browser_helpers/suite_runtime";

// Constants
const brepFilename = "test.og_brep";
const SURFACE_BOUNDARIES = 4;

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
    await expect(getFirstExpandableModelComponentRow(window)).toBeVisible();
    await expect(getModelComponentBoundariesRows(window)).toHaveCount(0);
  });

  test("expand a surface shows its boundaries", async ({ window }) => {
    await expandModelComponentRow(window, getFirstExpandableModelComponentRow(window));
    await expect(getModelComponentBoundariesRows(window)).toHaveCount(1);
    await expect(
      getModelComponentBoundariesRows(window).filter({
        hasText: `Boundaries (${SURFACE_BOUNDARIES})`,
      }),
    ).toHaveCount(1);
  });

  // The viewer highlights the lines of the group, not the surface
  test("hover the boundaries of a surface highlights its lines", async ({ window }) => {
    await getModelComponentBoundariesRows(window).first().hover();
    await waitForActionSettled(window);
  });

  test("expand the boundaries of a surface lists its lines", async ({ window }) => {
    const rowsBefore = await getModelComponentsTreeRows(window).count();
    await expandModelComponentRow(window, getModelComponentBoundariesRows(window).first());
    await expect(getModelComponentsTreeRows(window)).toHaveCount(rowsBefore + SURFACE_BOUNDARIES);
  });
}

export { registerTests };
