// The relations of the components, under their rows in the model components tree

// Third party imports
import type { Locator, Page } from "@playwright/test";

// Local imports
import { getModelComponentsObjectTree } from "./model_components_object_tree";
import { moveMouseOutOfTheWay } from "#browser_helpers/app_interaction";
import { waitForActionSettled } from "#browser_helpers/wait_for_action_settled";

function getModelComponentsTreeRows(window: Page): Locator {
  return getModelComponentsObjectTree(window).getByTestId("treeRowWrapper");
}

// The relation groups of the expanded components ("Boundaries (4)")
function getModelComponentBoundariesRows(window: Page): Locator {
  return getModelComponentsTreeRows(window).filter({ hasText: "Boundaries (" });
}

// The first component of the opened type that has relations: its row can be expanded
function getFirstExpandableModelComponentRow(window: Page): Locator {
  return getModelComponentsObjectTree(window)
    .locator(".leaf-row")
    .filter({ has: window.getByTestId("expandTreeRowButton") })
    .first();
}

async function expandModelComponentRow(window: Page, row: Locator): Promise<void> {
  await row.getByTestId("expandTreeRowButton").first().click();
  await moveMouseOutOfTheWay(window);
  await waitForActionSettled(window);
}

export {
  expandModelComponentRow,
  getFirstExpandableModelComponentRow,
  getModelComponentBoundariesRows,
  getModelComponentsTreeRows,
};
