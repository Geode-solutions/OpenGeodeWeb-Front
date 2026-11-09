import type { Page } from "@playwright/test";
import { meshViewerObjectType } from "#browser_helpers/constants";
import { setEdgesVisibility } from "#browser_helpers/viewer_interaction";

async function setMeshEdgesVisibility(window: Page, visibility: boolean): Promise<void> {
  await setEdgesVisibility(window, meshViewerObjectType, visibility);
}

export { setMeshEdgesVisibility };
