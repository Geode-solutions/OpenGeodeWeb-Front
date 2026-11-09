import type { Page } from "@playwright/test";
import { meshViewerObjectType } from "../../../constants";
import { setCellsVisibility } from "../../../viewer_interaction";

async function setMeshCellsVisibility(window: Page, visibility: boolean): Promise<void> {
  await setCellsVisibility(window, meshViewerObjectType, visibility);
}

export { setMeshCellsVisibility };
