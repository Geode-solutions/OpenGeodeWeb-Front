import type { Page } from "@playwright/test";
import { meshViewerObjectType } from "#browser_helpers/constants";
import { setPointsVisibility } from "#browser_helpers/viewer_interaction";

async function setMeshPointsVisibility(window: Page, visibility: boolean): Promise<void> {
  await setPointsVisibility(window, meshViewerObjectType, visibility);
}

export { setMeshPointsVisibility };
