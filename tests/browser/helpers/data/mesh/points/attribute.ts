import {
  SLIDER_PINK,
  clickColorPickerCanvas,
  clickColorPickerSlider,
} from "../../helpers/color_picker";
import { ensureMenuOpen, moveMouseOutOfTheWay, openStyleMenu } from "../../../viewer_interaction";
import { meshViewerObjectType, pointsFeatureName, vertexAttributeType } from "../../../constants";
import type { Page } from "@playwright/test";
import { setFeatureAttribute } from "../../helpers/attribute";
import { waitForActionSettled } from "../../../wait_for_action_settled";

interface AttributeOptions {
  item?: number;
  colorMap?: string;
  min?: number | string;
  max?: number | string;
}

async function setMeshPointsVertexAttribute(
  window: Page,
  attributeName: string,
  options: AttributeOptions = {},
): Promise<void> {
  await setFeatureAttribute(
    window,
    meshViewerObjectType,
    pointsFeatureName,
    vertexAttributeType,
    attributeName,
    options,
  );
}

async function openMeshPointsMenu(window: Page): Promise<void> {
  const menuTestId = `${meshViewerObjectType}${pointsFeatureName}Menu`;
  await openStyleMenu(window, menuTestId);
}

async function setMeshPointsNoDataColor(window: Page): Promise<void> {
  const menuTestId = `${meshViewerObjectType}${pointsFeatureName}Menu`;
  await ensureMenuOpen(window, menuTestId);
  const noDataColorBtn = window.getByTestId("noDataColorBtn").first();
  await noDataColorBtn.waitFor({ state: "visible" });
  await noDataColorBtn.click();
  await waitForActionSettled(window);
  await window
    .getByTestId("colorPicker")
    .filter({ visible: true })
    .first()
    .waitFor({ state: "visible" });
  await clickColorPickerSlider(window, SLIDER_PINK);
  await clickColorPickerCanvas(window);
  await noDataColorBtn.click();
  await moveMouseOutOfTheWay(window);
  await waitForActionSettled(window);
}

export { openMeshPointsMenu, setMeshPointsNoDataColor, setMeshPointsVertexAttribute };
