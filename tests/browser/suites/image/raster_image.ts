// Third party imports
import type { Page } from "@playwright/test";

// Local imports
import {
  ensureMenuOpen,
  moveMouseOutOfTheWay,
  setVisibilityGeneric,
} from "#browser_helpers/viewer_interaction";
import {
  expandMainObjectTree,
  openDataContextMenu,
} from "#browser_helpers/object_trees/main_object_tree";
import type { SuiteRuntime } from "#browser_helpers/suite_runtime";
import { closeAllMenus } from "#browser_helpers/app_interaction";
import { waitForActionSettled } from "#browser_helpers/wait_for_action_settled";

// Constants
const inputFilename = "test_texture.png";
const dataName = "test_texture";
const geodeObjectType = "RasterImage2D";
const menuTestId = "imageMenu";
const halfOpacity = 0.5;

// Images are not pickable: their menu opens from the object tree
async function openImageMenu(window: Page): Promise<void> {
  await openDataContextMenu(window, geodeObjectType, dataName);
  await ensureMenuOpen(window, menuTestId);
}

async function setImageOpacity(window: Page, opacity: number): Promise<void> {
  await ensureMenuOpen(window, menuTestId);
  const track = window.getByTestId("imageOpacitySlider").locator(".v-slider").first();
  const box = await track.boundingBox();
  if (!box) {
    throw new Error("Could not get bounding box of the image opacity slider");
  }
  await track.click({ position: { x: box.width * opacity, y: box.height / 2 } });
  await moveMouseOutOfTheWay(window);
  await waitForActionSettled(window);
}

// Shared with the apps built on this layer: each one runs it with its own test fixture and data loader
function registerTests({ test, loadTestDatas }: SuiteRuntime): void {
  test.describe.configure({ mode: "serial" });

  test("load shows the image colors", async ({ window }) => {
    await loadTestDatas(window, [inputFilename]);
    await expandMainObjectTree(window);
  });

  test("image menu", async ({ window }) => {
    await openImageMenu(window);
  });

  test("image opacity", async ({ window }) => {
    await setImageOpacity(window, halfOpacity);
  });

  test("image hidden", async ({ window }) => {
    await setVisibilityGeneric(window, menuTestId, "imageVisibilitySwitch", false);
  });

  test("close image menu", async ({ window }) => {
    await closeAllMenus(window);
  });
}

export { registerTests };
