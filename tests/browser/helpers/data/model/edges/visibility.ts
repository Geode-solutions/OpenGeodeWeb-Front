import type { Page } from "@playwright/test";
import { modelViewerObjectType } from "#browser_helpers/constants";
import { setEdgesVisibility } from "#browser_helpers/viewer_interaction";

async function setModelEdgesVisibility(window: Page, visibility: boolean): Promise<void> {
  await setEdgesVisibility(window, modelViewerObjectType, visibility);
}

export { setModelEdgesVisibility };
