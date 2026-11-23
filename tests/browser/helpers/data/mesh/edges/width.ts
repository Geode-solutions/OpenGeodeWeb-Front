import type { Page } from "@playwright/test";
import { meshViewerObjectType } from "#browser_helpers/constants";
import { setEdgesWidth } from "#browser_helpers/viewer_interaction";

async function setMeshEdgesWidth(window: Page, value: number): Promise<void> {
  await setEdgesWidth(window, meshViewerObjectType, value);
}

export { setMeshEdgesWidth };
