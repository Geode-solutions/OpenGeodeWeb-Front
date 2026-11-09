import type { Page } from "@playwright/test";
import { meshViewerObjectType } from "../../../constants";
import { setEdgesWidth } from "../../../viewer_interaction";

async function setMeshEdgesWidth(window: Page, value: number): Promise<void> {
  await setEdgesWidth(window, meshViewerObjectType, value);
}

export { setMeshEdgesWidth };
