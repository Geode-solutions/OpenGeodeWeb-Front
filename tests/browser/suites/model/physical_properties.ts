// Third party imports
import { expect } from "@playwright/test";

// Local imports
import {
  expandPhysicalProperties,
  getPhysicalPropertyColoringButton,
  getPhysicalValue,
  togglePhysicalPropertyColoring,
} from "#browser_helpers/object_trees/physical_properties";
import {
  getModelComponentsObjectTree,
  openModelComponentsTree,
  toggleModelTreeRow,
} from "#browser_helpers/object_trees/model_components_object_tree";
import { brepGeodeObjectType } from "#browser_helpers/constants";
import { fillSearchQuery } from "#browser_helpers/object_trees/common";
import { resetCamera } from "#browser_helpers/camera_interaction";

import type { SuiteRuntime } from "#browser_helpers/suite_runtime";

// Constants
// The cube of test.og_brep with a porosity from 0.1 on its left to 0.3 on its right, a boundary pressure of 1e7 and
// 2e7 Pa on two Surfaces, the second one on top, and a displacement fixed along y only on two others
const brepFilename = "test_physical_properties.og_brep";
// Start of the data name, still shown once the label is truncated in the middle
const dataName = "test_phys";
const blockId = "00000000-4335-411d-8000-000079b34fe5";
const lowPressureSurfaceId = "00000000-dcfe-400a-8000-0000a72c4f30";
const highPressureSurfaceId = "00000000-8afd-4969-8000-000092a43747";
const fixedSurfaceId = "00000000-cddf-4c1c-8000-00005ebbcaeb";

// Shared with the apps built on this layer: each one runs it with its own test fixture and data loader
function registerTests({ test, loadTestDatas }: SuiteRuntime): void {
  test.describe.configure({ mode: "serial" });

  test("load a brep with physical properties", async ({ window }) => {
    await loadTestDatas(window, [brepFilename]);
    await resetCamera(window);
  });

  test("the physical properties and their values", async ({ window }) => {
    await openModelComponentsTree(window, brepGeodeObjectType, dataName);
    await expandPhysicalProperties(window, [
      "porosity",
      "boundary_pressure",
      "boundary_displacement",
    ]);
    await expect(getPhysicalValue(window, blockId)).toHaveText("0.1 – 0.3");
    await expect(getPhysicalValue(window, lowPressureSurfaceId)).toHaveText("1e7");
    await expect(getPhysicalValue(window, highPressureSurfaceId)).toHaveText("2e7");
    await expect(getPhysicalValue(window, fixedSurfaceId)).toHaveText("(–, 0, –)");
  });

  test("color the block by its porosity", async ({ window }) => {
    // The Surfaces hide the Block
    await toggleModelTreeRow(window, "Surfaces");
    await togglePhysicalPropertyColoring(window, "porosity");
    // The palette icon fills while the model is colored by the property
    await expect(
      getPhysicalPropertyColoringButton(window, "porosity").locator(".ph-fill"),
    ).toHaveCount(1);
  });

  test("remove the porosity coloring", async ({ window }) => {
    await togglePhysicalPropertyColoring(window, "porosity");
    await expect(
      getPhysicalPropertyColoringButton(window, "porosity").locator(".ph-fill"),
    ).toHaveCount(0);
  });

  test("color the boundaries by their pressure", async ({ window }) => {
    await toggleModelTreeRow(window, "Surfaces");
    await togglePhysicalPropertyColoring(window, "boundary_pressure");
  });

  // As in any tree, a search shows the matching rows only: the property, not its components
  test("search a physical property by its name", async ({ window }) => {
    await fillSearchQuery(window, "poro", getModelComponentsObjectTree(window));
    await expect(getPhysicalPropertyColoringButton(window, "porosity")).toBeVisible();
    await expect(getPhysicalPropertyColoringButton(window, "boundary_pressure")).toBeHidden();
  });

  test("search the physical properties of a component", async ({ window }) => {
    await fillSearchQuery(window, fixedSurfaceId, getModelComponentsObjectTree(window));
    await expect(getPhysicalValue(window, fixedSurfaceId)).toBeVisible();
    await expect(getPhysicalValue(window, blockId)).toBeHidden();
  });

  test("clearing the search shows every physical property again", async ({ window }) => {
    await fillSearchQuery(window, "", getModelComponentsObjectTree(window));
    await expect(getPhysicalValue(window, blockId)).toBeVisible();
    await expect(getPhysicalValue(window, highPressureSurfaceId)).toBeVisible();
  });
}

export { registerTests };
