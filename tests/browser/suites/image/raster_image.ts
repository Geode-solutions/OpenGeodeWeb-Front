// Local imports
import { IMAGE_MENU_TEST_ID, openImageMenu, setImageOpacity } from "#browser_helpers/image";
import type { SuiteRuntime } from "#browser_helpers/suite_runtime";
import { closeAllMenus } from "#browser_helpers/app_interaction";
import { expandMainObjectTree } from "#browser_helpers/object_trees/main_object_tree";
import { setVisibilityGeneric } from "#browser_helpers/viewer_interaction";

// Constants
const inputFilename = "test_texture.png";
const dataName = "test_texture";
const geodeObjectType = "RasterImage2D";
const halfOpacity = 0.5;

// Shared with the apps built on this layer: each one runs it with its own test fixture and data loader
function registerTests({ test, loadTestDatas }: SuiteRuntime): void {
  test.describe.configure({ mode: "serial" });

  test("load shows the image colors", async ({ window }) => {
    await loadTestDatas(window, [inputFilename]);
    await expandMainObjectTree(window);
  });

  test("image menu", async ({ window }) => {
    await openImageMenu(window, geodeObjectType, dataName);
  });

  test("image opacity", async ({ window }) => {
    await setImageOpacity(window, halfOpacity);
  });

  test("image hidden", async ({ window }) => {
    await setVisibilityGeneric(window, IMAGE_MENU_TEST_ID, "imageVisibilitySwitch", false);
  });

  test("close image menu", async ({ window }) => {
    await closeAllMenus(window);
  });
}

export { registerTests };
