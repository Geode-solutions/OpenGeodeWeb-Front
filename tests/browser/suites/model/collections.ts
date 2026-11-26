// Third party imports
import { expect } from "@playwright/test";

// Local imports
import { defaultDataName, structuralModelGeodeObjectType } from "#browser_helpers/constants";
import {
  getModelComponentTypeTab,
  getModelComponentsObjectTree,
  openModelComponentContextMenu,
  openModelComponentsTree,
  toggleModelTreeRow,
} from "#browser_helpers/object_trees/model_components_object_tree";
import {
  setModelColor,
  setModelColoringStyle,
  setModelPolygonsVertexAttribute,
  setModelSurfacesVisibility,
} from "#browser_helpers/data/index";
import { expandGeodeObjectTypeInTree } from "#browser_helpers/object_trees/common";
import { moveMouseOutOfTheWay } from "#browser_helpers/app_interaction";
import { resetCamera } from "#browser_helpers/camera_interaction";

import type { SuiteRuntime } from "#browser_helpers/suite_runtime";

// Constants
const structuralModelFilename = "test.og_strm";
const collectionTypeRowName = "ModelBoundaries";
// Start of the collection id, still shown once the label is truncated in the middle
const collectionRowName = "019ea684-37";
const vertexAttributeName = "test_vertex";

// Shared with the apps built on this layer: each one runs it with its own test fixture and data loader
function registerTests({ test, loadTestDatas }: SuiteRuntime): void {
  test.describe.configure({ mode: "serial" });

  test("load structural model", async ({ window }) => {
    await loadTestDatas(window, [structuralModelFilename]);
    await resetCamera(window);
  });

  test("open collections tree", async ({ window }) => {
    await openModelComponentsTree(window, structuralModelGeodeObjectType, defaultDataName);
    await expandGeodeObjectTypeInTree(
      window,
      collectionTypeRowName,
      getModelComponentsObjectTree(window),
    );
    await moveMouseOutOfTheWay(window);
  });

  test("hide blocks", async ({ window }) => {
    await toggleModelTreeRow(window, "Blocks");
    await moveMouseOutOfTheWay(window);
  });

  test("collection type color", async ({ window }) => {
    await openModelComponentContextMenu(window, collectionTypeRowName);
    await expect(getModelComponentTypeTab(window)).toHaveText("Surfaces");
    await setModelColor(window);
    await moveMouseOutOfTheWay(window);
  });

  test("collection visibility", async ({ window }) => {
    await openModelComponentContextMenu(window, collectionRowName);
    await setModelSurfacesVisibility(window, false);
    await moveMouseOutOfTheWay(window);
  });

  test("collection vertex attribute", async ({ window }) => {
    await openModelComponentContextMenu(window, collectionRowName);
    await setModelSurfacesVisibility(window, true);
    await setModelPolygonsVertexAttribute(window, vertexAttributeName, {
      item: 0,
      colorMap: "vikO",
    });
    await moveMouseOutOfTheWay(window);
  });

  test("collection type random color", async ({ window }) => {
    await openModelComponentContextMenu(window, collectionTypeRowName);
    await setModelColoringStyle(window, "Random");
    await moveMouseOutOfTheWay(window);
  });
}

export { registerTests };
