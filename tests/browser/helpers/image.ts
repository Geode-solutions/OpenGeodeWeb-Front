// Third party imports
import type { Page } from "@playwright/test";

// Local imports
import { ensureMenuOpen, moveMouseOutOfTheWay } from "./viewer_interaction";
import { openDataContextMenu } from "./object_trees/main_object_tree";
import { waitForActionSettled } from "./wait_for_action_settled";

const IMAGE_MENU_TEST_ID = "imageMenu";

// Images are not pickable: their menu opens from the object tree
async function openImageMenu(
  window: Page,
  geodeObjectType: string,
  dataName: string,
): Promise<void> {
  await openDataContextMenu(window, geodeObjectType, dataName);
  await ensureMenuOpen(window, IMAGE_MENU_TEST_ID);
}

async function setImageOpacity(window: Page, opacity: number): Promise<void> {
  await ensureMenuOpen(window, IMAGE_MENU_TEST_ID);
  const track = window.getByTestId("imageOpacitySlider").locator(".v-slider").first();
  const box = await track.boundingBox();
  if (!box) {
    throw new Error("Could not get bounding box of the image opacity slider");
  }
  await track.click({ position: { x: box.width * opacity, y: box.height / 2 } });
  await moveMouseOutOfTheWay(window);
  await waitForActionSettled(window);
}

export { IMAGE_MENU_TEST_ID, openImageMenu, setImageOpacity };
