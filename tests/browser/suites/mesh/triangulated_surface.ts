// Node imports

// Third party imports

// Local imports
import { defaultDataName, triangulatedSurfaceGeodeObjectType } from "#browser_helpers/constants";
import {
  expandMainObjectTree,
  highlightData,
} from "#browser_helpers/object_trees/main_object_tree";
import {
  openMeshPolygonsMenu,
  setMeshEdgesColor,
  setMeshEdgesVisibility,
  setMeshEdgesWidth,
  setMeshPointsColor,
  setMeshPointsSize,
  setMeshPointsVisibility,
  setMeshPolygonsColor,
  setMeshPolygonsColorMap,
  setMeshPolygonsItem,
  setMeshPolygonsNoDataColor,
  setMeshPolygonsOpacity,
  setMeshPolygonsPolygonAttribute,
  setMeshPolygonsTextures,
  setMeshPolygonsVertexAttribute,
  setMeshPolygonsVisibility,
} from "#browser_helpers/data/index";
import { toggleInfoCard, viewerContextMenu } from "#browser_helpers/viewer_interaction";
import { closeFeedbackSnackbar } from "#browser_helpers/app_interaction";

import type { SuiteRuntime } from "#browser_helpers/suite_runtime";

// Constants
const inputFilename = "test.og_tsf3d";
const polygonAttributeName = "test_polygon";
const vertexAttributeName = "test_vertex";
const vertexAttributeName2 = "test_vertex2";
const colorMapName = "vikO";
const polygonsOpacity = 50;
const pointsSize = 15;
const edgesWidth = 5;

// Shared with the apps built on this layer: each one runs it with its own test fixture and data loader
function registerTests({ test, loadTestDatas }: SuiteRuntime): void {
  test.describe.configure({ mode: "serial" });

  test("load", async ({ window }) => {
    await loadTestDatas(window, [inputFilename]);
    await expandMainObjectTree(window);
  });

  test("highlight", async ({ window, screenshotMask }) => {
    await highlightData(window, triangulatedSurfaceGeodeObjectType, defaultDataName);
    screenshotMask.locators = [window.getByTestId("tooltipIdValue")];
  });

  test("viewer context menu", async ({ window }) => {
    const x = 549;
    const y = 210;
    await viewerContextMenu(window, x, y);
  });

  test("info card", async ({ window }) => {
    await toggleInfoCard(window);
  });

  test("points visibility", async ({ window }) => {
    await toggleInfoCard(window);
    await setMeshPointsVisibility(window, true);
  });

  test("polygon attribute", async ({ window }) => {
    await setMeshPointsVisibility(window, false);
    await setMeshPolygonsPolygonAttribute(window, polygonAttributeName);
  });

  test("polygon attribute change colormap", async ({ window }) => {
    await setMeshPolygonsColorMap(window, colorMapName);
  });

  test("polygon attribute reopen menu", async ({ window }) => {
    await openMeshPolygonsMenu(window);
  });

  test("vertex attribute", async ({ window }) => {
    await setMeshPolygonsVertexAttribute(window, vertexAttributeName, {
      item: 2,
      colorMap: colorMapName,
    });
  });

  test("vertex attribute unmapped elements color", async ({ window }) => {
    await setMeshPolygonsNoDataColor(window);
  });

  test("vertex attribute change item to 1", async ({ window }) => {
    await setMeshPolygonsItem(window, 0);
  });

  test("vertex attribute change item to 2", async ({ window }) => {
    await setMeshPolygonsItem(window, 1);
  });

  test("vertex attribute change attribute name", async ({ window }) => {
    await setMeshPolygonsVertexAttribute(window, vertexAttributeName2);
  });

  test("vertex attribute switch back to first attribute", async ({ window }) => {
    await setMeshPolygonsVertexAttribute(window, vertexAttributeName);
  });

  test("vertex attribute reopen menu", async ({ window }) => {
    await openMeshPolygonsMenu(window);
  });

  test("polygons color", async ({ window }) => {
    await setMeshPolygonsColor(window);
  });

  test("points color", async ({ window }) => {
    await setMeshPointsColor(window);
  });

  test("edges color", async ({ window }) => {
    await setMeshEdgesColor(window);
  });

  test("opacity", async ({ window }) => {
    await setMeshPolygonsOpacity(window, polygonsOpacity);
  });

  test("points size", async ({ window }) => {
    await setMeshPointsSize(window, pointsSize);
  });

  test("edges width", async ({ window }) => {
    await setMeshEdgesWidth(window, edgesWidth);
  });

  test("edges visibility", async ({ window }) => {
    await setMeshEdgesVisibility(window, false);
  });

  test("polygons visibility", async ({ window }) => {
    await setMeshEdgesVisibility(window, true);
    await setMeshPolygonsVisibility(window, false);
  });

  test("polygons textures", async ({ window }) => {
    await setMeshPolygonsVisibility(window, true);
    await setMeshPolygonsTextures(window);
    await closeFeedbackSnackbar(window);
  });
}

export { registerTests };
