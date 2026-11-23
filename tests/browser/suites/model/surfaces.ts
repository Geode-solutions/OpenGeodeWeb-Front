// Node imports

// Third party imports

// Local imports
import {
  brepGeodeObjectType,
  defaultDataName,
  polygonAttributeType,
  vertexAttributeType,
} from "#browser_helpers/constants";
import { closeAllMenus, moveMouseOutOfTheWay } from "#browser_helpers/app_interaction";
import {
  closeObjectsTree,
  expandMainObjectTree,
} from "#browser_helpers/object_trees/main_object_tree";
import {
  copyModelPolygonsColor,
  pasteModelPolygonsColorInput,
  setModelColor,
  setModelPointsVisibility,
  setModelPolygonsColorInput,
  setModelPolygonsPolygonAttribute,
  setModelPolygonsVertexAttribute,
  setModelPolygonsVertexAttributeNoDataColor,
} from "#browser_helpers/data/index";
import {
  expandMeshComponentType,
  getModelComponentsObjectTree,
  openModelComponentContextMenu,
  openModelComponentsTree,
  setModelTreeRowColorRandom,
  toggleModelTreeRow,
} from "#browser_helpers/object_trees/model_components_object_tree";
import {
  getHybridViewerCanvas,
  getHybridViewerCanvasBoundingBox,
  viewerContextMenu,
} from "#browser_helpers/viewer_interaction";
import { applyAttribute } from "#browser_helpers/data/helpers/attribute";
import { hideObjectInTree } from "#browser_helpers/object_trees/common";
import { rotateCamera } from "#browser_helpers/camera_interaction";
import { waitForActionSettled } from "#browser_helpers/wait_for_action_settled";

import type { SuiteRuntime } from "#browser_helpers/suite_runtime";

// Constants
const brepFilename = "test.og_brep";
const vertexAttributeName = "test_vertex";
const polygonAttributeName = "test_polygon";
const ROTATE_LEFT_A_LITTLE = -180;

// Shared with the apps built on this layer: each one runs it with its own test fixture and data loader
function registerTests({ test, loadTestDatas }: SuiteRuntime): void {
  test.describe.configure({ mode: "serial" });

  test("load brep and open model components", async ({ window }) => {
    await loadTestDatas(window, [brepFilename]);
    await expandMainObjectTree(window);
    await openModelComponentsTree(window, brepGeodeObjectType, defaultDataName);
    await hideObjectInTree(window, "Blocks", undefined, getModelComponentsObjectTree(window));
    await moveMouseOutOfTheWay(window);
  });

  test("surfaces visibility", async ({ window }) => {
    await closeAllMenus(window);
    await toggleModelTreeRow(window, "Surfaces");
  });

  test("surfaces color", async ({ window }) => {
    await toggleModelTreeRow(window, "Surfaces");
    await setModelTreeRowColorRandom(window, "Surfaces");
  });

  test("surfaces copy color to clipboard", async ({ window }) => {
    await copyModelPolygonsColor(window);
  });

  test("surfaces set color via input", async ({ window }) => {
    await setModelPolygonsColorInput(window, "0, 255, 0");
  });

  test("surfaces paste color in input", async ({ window }) => {
    await pasteModelPolygonsColorInput(window);
  });

  test("surfaces vertex attribute all surfaces", async ({ window }) => {
    await expandMeshComponentType(window, "Surfaces");
    await openModelComponentContextMenu(window, "00000000-", 0);
    await setModelPolygonsVertexAttribute(window, vertexAttributeName, {
      item: 0,
      colorMap: "vikO",
    });
    await moveMouseOutOfTheWay(window);
  });

  test("surfaces vertex attribute unmapped elements color", async ({ window }) => {
    await setModelPolygonsVertexAttributeNoDataColor(window);
  });

  test("surfaces vertex attribute all surfaces change item", async ({ window }) => {
    await setModelPolygonsVertexAttribute(window, vertexAttributeName, { item: 1 });
    await moveMouseOutOfTheWay(window);
  });

  test("toggle object tree main", async ({ window }) => {
    await closeObjectsTree(window);
  });

  test("surfaces vertex attribute one surface ", async ({ window }) => {
    await openModelComponentContextMenu(window, "00000000-", 0);
    const componentOptions = window.getByTestId("modelComponentOptions");
    await applyAttribute(window, componentOptions, {
      attributeType: vertexAttributeType,
      attributeName: vertexAttributeName,
      colorMap: "roma",
    });
    await rotateCamera(window, ROTATE_LEFT_A_LITTLE, 0);
    await moveMouseOutOfTheWay(window);
  });

  test("surfaces polygon attribute all surfaces", async ({ window }) => {
    await openModelComponentContextMenu(window, "00000000-", 0);
    await setModelPolygonsPolygonAttribute(window, polygonAttributeName, { item: 2 });
    await moveMouseOutOfTheWay(window);
  });

  test("surfaces polygon attribute one surface", async ({ window }) => {
    await openModelComponentContextMenu(window, "00000000-", 0);
    const componentOptions = window.getByTestId("modelComponentOptions");
    await applyAttribute(window, componentOptions, {
      attributeType: polygonAttributeType,
      attributeName: polygonAttributeName,
    });
    await moveMouseOutOfTheWay(window);
  });

  test("hide points in model tree", async ({ window }) => {
    await toggleModelTreeRow(window, "Surfaces");
    const modelComponentsObjectTree = getModelComponentsObjectTree(window);
    await modelComponentsObjectTree
      .locator(".tree-row-wrapper", { hasText: "Surfaces" })
      .locator(".tree-item-label")
      .first()
      .click({ button: "right" });
    await setModelPointsVisibility(window, false);
  });

  test("context menu through non visible surface", async ({ window }) => {
    const modelComponentsObjectTree = getModelComponentsObjectTree(window);
    await modelComponentsObjectTree
      .locator(".tree-row-wrapper", { hasText: "00000000-" })
      .nth(4)
      .locator(".ph-eye-slash")
      .first()
      .click();
    await waitForActionSettled(window);
    const hybridViewerCanvas = getHybridViewerCanvas(window);
    const box = await getHybridViewerCanvasBoundingBox(hybridViewerCanvas);
    await viewerContextMenu(window, box.width / 2, box.height / 2);
    await setModelColor(window);
  });
}

export { registerTests };
