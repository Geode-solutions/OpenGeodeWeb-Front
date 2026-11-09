import type { Page } from "@playwright/test";
import { meshViewerObjectType } from "#browser_helpers/constants";
import { setPolyhedraVisibility } from "#browser_helpers/viewer_interaction";

async function setMeshPolyhedraVisibility(window: Page, visibility: boolean): Promise<void> {
  await setPolyhedraVisibility(window, meshViewerObjectType, visibility);
}

export { setMeshPolyhedraVisibility };
