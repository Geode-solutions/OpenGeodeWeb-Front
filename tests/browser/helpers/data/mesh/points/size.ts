import type { Page } from "@playwright/test";
import { meshViewerObjectType } from "#browser_helpers/constants";
import { setPointsSize } from "#browser_helpers/viewer_interaction";

async function setMeshPointsSize(window: Page, value: number): Promise<void> {
  await setPointsSize(window, meshViewerObjectType, value);
}

export { setMeshPointsSize };
