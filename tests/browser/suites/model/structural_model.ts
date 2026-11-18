// Node imports

// Third party imports

// Local imports
import {
  brepGeodeObjectType,
  defaultDataName,
  polyhedronAttributeType,
  structuralModelGeodeObjectType,
  vertexAttributeType,
} from "#browser_helpers/constants";
import {
  expandGeodeObjectTypeInTree,
  hideObjectInTree,
} from "#browser_helpers/object_trees/common";
import {
  expandMainObjectTree,
  getMainObjectTree,
  toggleObjectsTree,
} from "#browser_helpers/object_trees/main_object_tree";
import {
  openModelComponentContextMenu,
  openModelComponentsTree,
  toggleModelTreeRow,
} from "#browser_helpers/object_trees/model_components_object_tree";
import { resetCamera, rotateCamera } from "#browser_helpers/camera_interaction";
import {
  setModelEdgesVisibility,
  setModelPointsVisibility,
  setModelPolyhedraPolyhedronAttribute,
  setModelPolyhedraVertexAttribute,
  setModelPolyhedraVertexAttributeNoDataColor,
} from "#browser_helpers/data/index";
import { applyAttribute } from "#browser_helpers/data/helpers/attribute";
import { moveMouseOutOfTheWay } from "#browser_helpers/app_interaction";

import type { SuiteRuntime } from "#browser_helpers/suite_runtime";

// Constants
const brepFilename = "test.og_brep";
const structuralModelFilename = "test.og_strm";
const vertexAttributeName = "test_vertex";
const polyhedronAttributeName = "test_polyhedron";
const ROTATE_LEFT_A_LITTLE = -180;

// Shared with the apps built on this layer: each one runs it with its own test fixture and data loader
function registerTests({ test, loadTestDatas }: SuiteRuntime): void {
  test.describe.configure({ mode: "serial" });

  test("load brep and open model components", async ({ window }) => {
    await loadTestDatas(window, [brepFilename]);
    await expandMainObjectTree(window);
    await rotateCamera(window, ROTATE_LEFT_A_LITTLE, 0);
    await openModelComponentsTree(window, brepGeodeObjectType, defaultDataName);
    await moveMouseOutOfTheWay(window);
  });

  test("load structural model", async ({ window }) => {
    await loadTestDatas(window, [structuralModelFilename]);
    await expandMainObjectTree(window);
    await resetCamera(window);
  });

  test("toggle both model component trees", async ({ window }) => {
    await hideObjectInTree(window, "BRep", undefined, getMainObjectTree(window));
    await resetCamera(window);
    await openModelComponentsTree(window, structuralModelGeodeObjectType, defaultDataName);
    await resetCamera(window);
    await toggleObjectsTree(window);
    await moveMouseOutOfTheWay(window);
  });

  test("show points of surface in model tree", async ({ window }) => {
    await toggleModelTreeRow(window, "Surfaces", 0, 1);
    const secondModelTree = window.getByTestId("modelComponentsObjectTree").nth(1);
    await expandGeodeObjectTypeInTree(window, "Surfaces", secondModelTree);
    await openModelComponentContextMenu(window, "019ea682-", 0, 1);
    await setModelPointsVisibility(window, true);
    await moveMouseOutOfTheWay(window);
  });

  test("show edges of surface in model tree", async ({ window }) => {
    await openModelComponentContextMenu(window, "019ea682-", 0, 1);
    await setModelEdgesVisibility(window, true);
    await moveMouseOutOfTheWay(window);
  });

  test("hide edges and points of surface in model tree", async ({ window }) => {
    await openModelComponentContextMenu(window, "019ea682-", 0, 1);
    await setModelEdgesVisibility(window, false);
    await setModelPointsVisibility(window, false);
    await moveMouseOutOfTheWay(window);
  });

  test("blocks vertex attribute all blocks", async ({ window }) => {
    const secondModelTree = window.getByTestId("modelComponentsObjectTree").nth(1);
    await expandGeodeObjectTypeInTree(window, "Blocks", secondModelTree);
    await openModelComponentContextMenu(window, "019ea699-", 0, 1);
    await setModelPolyhedraVertexAttribute(window, vertexAttributeName, {
      item: 0,
      colorMap: "vikO",
    });
    await moveMouseOutOfTheWay(window);
  });

  test("blocks vertex attribute unmapped elements color", async ({ window }) => {
    await setModelPolyhedraVertexAttributeNoDataColor(window);
  });

  test("blocks vertex attribute all blocks change item", async ({ window }) => {
    await setModelPolyhedraVertexAttribute(window, vertexAttributeName, { item: 1 });
    await moveMouseOutOfTheWay(window);
  });

  test("blocks vertex attribute one block", async ({ window }) => {
    const secondModelTree = window.getByTestId("modelComponentsObjectTree").nth(1);
    await expandGeodeObjectTypeInTree(window, "Blocks", secondModelTree);
    await openModelComponentContextMenu(window, "019ea699-", 3, 1);
    const componentOptions = window.getByTestId("modelComponentOptions");
    await applyAttribute(window, componentOptions, {
      attributeType: vertexAttributeType,
      attributeName: vertexAttributeName,
      colorMap: "roma",
    });
  });

  test("blocks polyhedron attribute all blocks", async ({ window }) => {
    await openModelComponentContextMenu(window, "019ea699-", 0, 1);
    await setModelPolyhedraPolyhedronAttribute(window, polyhedronAttributeName, { item: 2 });
    await moveMouseOutOfTheWay(window);
  });

  test("blocks polyhedron attribute one block", async ({ window }) => {
    await openModelComponentContextMenu(window, "019ea699-", 3, 1);
    const componentOptions = window.getByTestId("modelComponentOptions");
    await applyAttribute(window, componentOptions, {
      attributeType: polyhedronAttributeType,
      attributeName: polyhedronAttributeName,
    });
    await moveMouseOutOfTheWay(window);
  });
}

export { registerTests };
