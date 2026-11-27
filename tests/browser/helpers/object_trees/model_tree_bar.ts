import type { Locator, Page } from "@playwright/test";
import { getModelComponentsObjectTree } from "./model_components_object_tree";
import { moveMouseOutOfTheWay } from "#browser_helpers/app_interaction";
import { waitForActionSettled } from "#browser_helpers/wait_for_action_settled";

// The model trees in the activity bar: a button per open model tree, and one for them all
const DRAG_STEPS = 10;

function getModelTreeToggles(window: Page): Locator {
  return window.getByTestId("modelTreeToggle");
}

function getModelTreeRows(window: Page): Locator {
  return getModelComponentsObjectTree(window).getByTestId("treeRowWrapper");
}

async function clickModelTreeBarButton(window: Page, locator: Locator): Promise<void> {
  await locator.click();
  await moveMouseOutOfTheWay(window);
  await waitForActionSettled(window);
}

// The colors of the model trees, in the order of their panels and of their buttons in the activity bar
async function getModelTreePanelColors(window: Page): Promise<string[]> {
  const colors = await window.locator(".tree-box").evaluateAll((boxes) =>
    boxes
      .map((box) => {
        if (box instanceof HTMLElement) {
          return box.style.getPropertyValue("--tree-box-accent");
        }
        return "";
      })
      .filter((color) => color !== ""),
  );
  return colors;
}

async function getModelTreeButtonColors(window: Page): Promise<string[]> {
  const colors = await getModelTreeToggles(window).evaluateAll((toggles) =>
    toggles.map((toggle) => {
      if (toggle instanceof HTMLElement) {
        return toggle.style.getPropertyValue("--model-tree-color");
      }
      return "";
    }),
  );
  return colors;
}

// Drags a model button over another one with the mouse, as the native drag and drop needs
async function dragModelTreeButton(
  window: Page,
  fromIndex: number,
  toIndex: number,
): Promise<void> {
  const source = await getModelTreeToggles(window).nth(fromIndex).boundingBox();
  const target = await getModelTreeToggles(window).nth(toIndex).boundingBox();
  if (source === null || target === null) {
    throw new Error("The model buttons are not displayed.");
  }
  await window.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
  await window.mouse.down();
  await window.mouse.move(target.x + target.width / 2, target.y + target.height / 2, {
    steps: DRAG_STEPS,
  });
  await window.mouse.up();
  await moveMouseOutOfTheWay(window);
  await waitForActionSettled(window);
}

export {
  clickModelTreeBarButton,
  dragModelTreeButton,
  getModelTreeButtonColors,
  getModelTreePanelColors,
  getModelTreeRows,
  getModelTreeToggles,
};
