import type { Page } from "@playwright/test";
import { modelViewerObjectType } from "../../../constants";
import { setPointsVisibility } from "../../../viewer_interaction";

async function setModelPointsVisibility(window: Page, visibility: boolean): Promise<void> {
  await setPointsVisibility(window, modelViewerObjectType, visibility);
}

export { setModelPointsVisibility };
