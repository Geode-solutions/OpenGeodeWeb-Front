import type { Page } from "@playwright/test";
import { meshViewerObjectType } from "#browser_helpers/constants";
import { setCellsVisibility } from "#browser_helpers/viewer_interaction";

async function setMeshCellsVisibility(window: Page, visibility: boolean): Promise<void> {
  await setCellsVisibility(window, meshViewerObjectType, visibility);
}

export { setMeshCellsVisibility };
