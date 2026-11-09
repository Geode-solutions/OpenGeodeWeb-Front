import type { Page } from "@playwright/test";
import { meshViewerObjectType } from "../../../constants";
import { setPolygonsVisibility } from "../../../viewer_interaction";

async function setMeshPolygonsVisibility(window: Page, visibility: boolean): Promise<void> {
  await setPolygonsVisibility(window, meshViewerObjectType, visibility);
}

export { setMeshPolygonsVisibility };
