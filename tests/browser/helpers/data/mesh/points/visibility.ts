import type { Page } from "@playwright/test";
import { meshViewerObjectType } from "../../../constants";
import { setPointsVisibility } from "../../../viewer_interaction";

async function setMeshPointsVisibility(window: Page, visibility: boolean): Promise<void> {
  await setPointsVisibility(window, meshViewerObjectType, visibility);
}

export { setMeshPointsVisibility };
