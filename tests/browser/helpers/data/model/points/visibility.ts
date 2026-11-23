import type { Page } from "@playwright/test";
import { modelViewerObjectType } from "#browser_helpers/constants";
import { setPointsVisibility } from "#browser_helpers/viewer_interaction";

async function setModelPointsVisibility(window: Page, visibility: boolean): Promise<void> {
  await setPointsVisibility(window, modelViewerObjectType, visibility);
}

export { setModelPointsVisibility };
