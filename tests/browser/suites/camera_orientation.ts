// Node imports

// Third party imports
import type { Page } from "@playwright/test";

// Local imports
import { closeAllMenus, moveMouseOutOfTheWay } from "#browser_helpers/app_interaction";
import {
  resetCamera,
  selectCameraOrientation,
  toggleCameraOrientation,
} from "#browser_helpers/camera_interaction";
import { sceneContextMenu } from "#browser_helpers/viewer_canvas";
import { waitForActionSettled } from "#browser_helpers/wait_for_action_settled";

import type { SuiteRuntime } from "#browser_helpers/suite_runtime";

// Constants
const brepFilename = "test.og_brep";

async function setOrientationWidget(window: Page, marker: "axes" | "compass"): Promise<void> {
  await sceneContextMenu(window);
  await window.getByTestId("sceneOrientationWidgetMenu").click();
  await waitForActionSettled(window);
  const toggle =
    marker === "compass" ? "sceneOrientationWidgetCompass" : "sceneOrientationWidgetAxes";
  await window.getByTestId(toggle).click();
  await waitForActionSettled(window);
  await closeAllMenus(window);
}

async function hoverCameraOrientation(window: Page, vtkKey: string): Promise<void> {
  await window.getByTestId(`cameraOrientation${vtkKey}Button`).hover();
  await waitForActionSettled(window);
}

// Shared with the apps built on this layer: each one runs it with its own test fixture and data loader
function registerTests({ test, loadTestDatas }: SuiteRuntime): void {
  test.describe.configure({ mode: "serial" });

  test("load", async ({ window }) => {
    await loadTestDatas(window, [brepFilename]);
    await resetCamera(window);
  });

  test("orientation panel reads the world axes", async ({ window }) => {
    await toggleCameraOrientation(window);
    await hoverCameraOrientation(window, "XPlus");
  });

  test("orientation panel reads the compass directions", async ({ window }) => {
    await toggleCameraOrientation(window);
    await setOrientationWidget(window, "compass");
    await toggleCameraOrientation(window);
    await hoverCameraOrientation(window, "YPlus");
  });

  test("compass orientation panel turns with the camera", async ({ window }) => {
    // North (Y+) looks from the north: the dial turns south up
    await selectCameraOrientation(window, "Y+");
    await moveMouseOutOfTheWay(window);
  });

  test("orientation widget back to the axes", async ({ window }) => {
    await toggleCameraOrientation(window);
    await setOrientationWidget(window, "axes");
    await resetCamera(window);
  });
}

export { registerTests };
