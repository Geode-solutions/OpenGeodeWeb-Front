import type { Page } from "@playwright/test";
import { meshViewerObjectType } from "../../../constants";
import { setEdgesVisibility } from "../../../viewer_interaction";

async function setMeshEdgesVisibility(window: Page, visibility: boolean): Promise<void> {
  await setEdgesVisibility(window, meshViewerObjectType, visibility);
}

export { setMeshEdgesVisibility };
