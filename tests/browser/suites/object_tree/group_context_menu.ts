// Node imports

// Third party imports

// Local imports
import {
  expandMainObjectTree,
  openDataContextMenu,
  openGeodeObjectTypeContextMenu,
} from "#browser_helpers/object_trees/main_object_tree";
import {
  openMeshEdgesMenu,
  openMeshPointsMenu,
  openMeshPolygonsMenu,
  setMeshEdgesVisibility,
  setMeshPointsVisibility,
  setMeshPolygonsColor,
  setMeshPolygonsColorInput,
  setMeshPolygonsVertexAttribute,
} from "#browser_helpers/data/index";
import { closeAllMenus } from "#browser_helpers/app_interaction";
import { polygonalSurfaceGeodeObjectType } from "#browser_helpers/constants";
import { resetCamera } from "#browser_helpers/camera_interaction";

import type { SuiteRuntime } from "#browser_helpers/suite_runtime";

// Constants
const inputFilename = "test.og_psf3d";
const translatedInputFilename = "test_translated.og_psf3d";
const translatedDataName = "test_translated";
const vertexAttributeName = "test_vertex";
const dataColor = "0, 0, 255";

// Shared with the apps built on this layer: each one runs it with its own test fixture and data loader
function registerTests({ test, loadTestDatas }: SuiteRuntime): void {
  test.describe.configure({ mode: "serial" });

  test("load", async ({ window }) => {
    await loadTestDatas(window, [inputFilename]);
    await loadTestDatas(window, [translatedInputFilename]);
    await expandMainObjectTree(window);
  });

  test("reset camera", async ({ window }) => {
    await resetCamera(window);
  });

  test("geode object type context menu", async ({ window }) => {
    await openGeodeObjectTypeContextMenu(window, polygonalSurfaceGeodeObjectType);
  });

  test("geode object type polygons menu", async ({ window }) => {
    await openMeshPolygonsMenu(window);
  });

  test("geode object type polygons color", async ({ window }) => {
    await setMeshPolygonsColor(window);
  });

  test("geode object type edges menu", async ({ window }) => {
    await openMeshEdgesMenu(window);
  });

  test("geode object type edges visibility", async ({ window }) => {
    await setMeshEdgesVisibility(window, true);
  });

  test("geode object type points menu", async ({ window }) => {
    await openMeshPointsMenu(window);
  });

  test("geode object type points visibility", async ({ window }) => {
    await setMeshPointsVisibility(window, true);
  });

  test("geode object type vertex attribute", async ({ window }) => {
    await setMeshPolygonsVertexAttribute(window, vertexAttributeName);
  });

  test("close geode object type context menu", async ({ window }) => {
    await closeAllMenus(window);
  });

  test("data context menu", async ({ window }) => {
    await openDataContextMenu(window, polygonalSurfaceGeodeObjectType, translatedDataName);
  });

  test("data polygons menu", async ({ window }) => {
    await openMeshPolygonsMenu(window);
  });

  test("data polygons color", async ({ window }) => {
    await setMeshPolygonsColorInput(window, dataColor);
  });

  test("close data context menu", async ({ window }) => {
    await closeAllMenus(window);
  });
}

export { registerTests };
