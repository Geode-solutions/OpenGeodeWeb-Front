import type { Page } from "@playwright/test";
import { modelViewerObjectType } from "../../../constants";
import { setEdgesVisibility } from "../../../viewer_interaction";

async function setModelEdgesVisibility(window: Page, visibility: boolean): Promise<void> {
  await setEdgesVisibility(window, modelViewerObjectType, visibility);
}

export { setModelEdgesVisibility };
