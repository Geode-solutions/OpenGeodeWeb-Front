import type { Locator, Page } from "@playwright/test";
import { SLIDER_PINK, clickColorPickerCanvas, clickColorPickerSlider } from "./color_picker";
import { ensureMenuOpen, moveMouseOutOfTheWay } from "#browser_helpers/viewer_interaction";
import { getMenuContainer, resetMenuScroll } from "./attribute_menu";
import { waitForActionSettled } from "#browser_helpers/wait_for_action_settled";

async function setFeatureColorMap(
  window: Page,
  menuTestId: string | Locator,
  colorMap: string,
): Promise<void> {
  const container = getMenuContainer(window, menuTestId);
  const colorMapPicker = container.getByTestId("colorMapPicker").first();
  await colorMapPicker.waitFor({ state: "visible" });
  await colorMapPicker.click();
  await waitForActionSettled(window);
  const colorMapListFilter = window.getByTestId("colorMapListFilter");
  await colorMapListFilter.filter({ visible: true }).first().locator("input").fill(colorMap);
  const colorMapListLoading = window.getByTestId("colorMapListLoading");
  await colorMapListLoading.waitFor({ state: "detached" });
  await waitForActionSettled(window);

  await window
    .getByTestId("colorMapList")
    .getByText(colorMap, { exact: true })
    .filter({ visible: true })
    .first()
    .click();
  await waitForActionSettled(window);

  await resetMenuScroll(window, 0);
  await moveMouseOutOfTheWay(window);
  await waitForActionSettled(window);
}

async function setQuickColorMap(window: Page, colorMap: string): Promise<void> {
  const colorMapListFilter = window
    .getByTestId("colorMapListFilter")
    .filter({ visible: true })
    .first();
  await colorMapListFilter.locator("input").waitFor({ state: "visible" });
  await colorMapListFilter.locator("input").fill(colorMap);
  const colorMapListLoading = window.getByTestId("colorMapListLoading");
  await colorMapListLoading.waitFor({ state: "detached" });
  await waitForActionSettled(window);

  await window
    .getByTestId("colorMapList")
    .getByText(colorMap, { exact: true })
    .filter({ visible: true })
    .first()
    .click();
  await waitForActionSettled(window);
  await moveMouseOutOfTheWay(window);
}

async function setFeatureNoDataColor(window: Page, menuTestId: string | Locator): Promise<void> {
  if (typeof menuTestId === "string") {
    await ensureMenuOpen(window, menuTestId);
  }
  const container = getMenuContainer(window, menuTestId);
  const noDataColorBtn = container.getByTestId("noDataColorBtn").first();
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
  await resetMenuScroll(window, 0);
  await moveMouseOutOfTheWay(window);
  await waitForActionSettled(window);
}

export { setFeatureColorMap, setFeatureNoDataColor, setQuickColorMap };
