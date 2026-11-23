import type { Page } from "@playwright/test";
import { setVisibilityGeneric } from "#browser_helpers/viewer_interaction";

async function setModelSurfacesVisibility(window: Page, visibility: boolean): Promise<void> {
  await setVisibilityGeneric(window, "modelStyleMenu", "modelSurfacesVisibilitySwitch", visibility);
}

export { setModelSurfacesVisibility };
