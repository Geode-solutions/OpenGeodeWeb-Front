import type { Page } from "@playwright/test";
import { meshViewerObjectType } from "../../../constants";
import { setPolyhedraVisibility } from "../../../viewer_interaction";

async function setMeshPolyhedraVisibility(window: Page, visibility: boolean): Promise<void> {
  await setPolyhedraVisibility(window, meshViewerObjectType, visibility);
}

export { setMeshPolyhedraVisibility };
