import type { Page } from "@playwright/test";
import { meshViewerObjectType } from "#browser_helpers/constants";
import { setPolygonsVisibility } from "#browser_helpers/viewer_interaction";

async function setMeshPolygonsVisibility(window: Page, visibility: boolean): Promise<void> {
  await setPolygonsVisibility(window, meshViewerObjectType, visibility);
}

export { setMeshPolygonsVisibility };
