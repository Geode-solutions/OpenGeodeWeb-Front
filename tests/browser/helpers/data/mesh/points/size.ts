import type { Page } from "@playwright/test";
import { meshViewerObjectType } from "../../../constants";
import { setPointsSize } from "../../../viewer_interaction";

async function setMeshPointsSize(window: Page, value: number): Promise<void> {
  await setPointsSize(window, meshViewerObjectType, value);
}

export { setMeshPointsSize };
