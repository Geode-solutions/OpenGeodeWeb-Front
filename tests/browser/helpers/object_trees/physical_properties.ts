// The physical properties group of a model tree: its rows, the value of a component and the coloring button of a
// Property

// Third party imports
import type { Locator, Page } from "@playwright/test";

// Local imports
import { closeAllMenus, moveMouseOutOfTheWay } from "#browser_helpers/app_interaction";
import { expandGeodeObjectTypeInTree } from "./common";
import { getModelComponentsObjectTree } from "./model_components_object_tree";
import { waitForActionSettled } from "#browser_helpers/wait_for_action_settled";

// Start of the group title, still shown once the label is truncated in the middle
const PHYSICAL_PROPERTIES_GROUP = "Physical pro";

function getPhysicalPropertyColoringButton(window: Page, name: string): Locator {
  return getModelComponentsObjectTree(window).getByTestId(`physicalPropertyColoring-${name}`);
}

// The row of a property, found by its coloring button (its title may be truncated). The button locator of `has` is
// Looked for inside each row: it starts from the page, not from the tree
function getPhysicalPropertyRow(window: Page, name: string): Locator {
  return getModelComponentsObjectTree(window)
    .getByTestId("treeRowWrapper")
    .filter({ has: window.getByTestId(`physicalPropertyColoring-${name}`) });
}

// Opens the group then the given properties, by their name (e.g. "porosity")
async function expandPhysicalProperties(window: Page, names: string[]): Promise<void> {
  await expandGeodeObjectTypeInTree(
    window,
    PHYSICAL_PROPERTIES_GROUP,
    getModelComponentsObjectTree(window),
  );
  for (const name of names) {
    // oxlint-disable-next-line no-await-in-loop -- each row moves once the previous one is opened
    await getPhysicalPropertyRow(window, name).getByTestId("expandTreeRowButton").click();
    // oxlint-disable-next-line no-await-in-loop
    await waitForActionSettled(window);
  }
  await moveMouseOutOfTheWay(window);
}

// The value of a property on a component, as its row shows it
function getPhysicalValue(window: Page, componentId: string): Locator {
  return getModelComponentsObjectTree(window).getByTestId(`physicalValue-${componentId}`);
}

// Colors the model by a property, by its name (e.g. "porosity"), or removes that coloring
async function togglePhysicalPropertyColoring(window: Page, name: string): Promise<void> {
  await closeAllMenus(window);
  await getPhysicalPropertyColoringButton(window, name).click();
  await moveMouseOutOfTheWay(window);
  await waitForActionSettled(window);
}

export {
  expandPhysicalProperties,
  getPhysicalPropertyColoringButton,
  getPhysicalValue,
  togglePhysicalPropertyColoring,
};
