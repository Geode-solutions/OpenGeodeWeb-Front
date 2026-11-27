// The physical properties tree of a model: opened from the model row of the objects tree, its property rows, the
// Value of a component and the coloring and eye buttons of a property

// Third party imports
import type { Locator, Page } from "@playwright/test";

// Local imports
import { closeAllMenus, moveMouseOutOfTheWay } from "#browser_helpers/app_interaction";
import { expandGeodeObjectType, getMainObjectTree } from "./main_object_tree";
import { getTreeRowByTextAndParent } from "./common";
import { waitForActionSettled } from "#browser_helpers/wait_for_action_settled";

function getPhysicalPropertiesObjectTree(window: Page): Locator {
  return window.getByTestId("physicalPropertiesObjectTree");
}

// Opens the physical properties tree of a model from its button, next to its model components one
async function openPhysicalPropertiesTree(
  window: Page,
  geodeObjectType: string,
  dataName: string,
): Promise<void> {
  await expandGeodeObjectType(window, geodeObjectType);
  const row = await getTreeRowByTextAndParent(
    window,
    geodeObjectType,
    dataName,
    getMainObjectTree(window),
  );
  await row.getByTestId("physicalPropertiesButton").click();
  await moveMouseOutOfTheWay(window);
  await waitForActionSettled(window);
}

function getPhysicalPropertyColoringButton(window: Page, name: string): Locator {
  return getPhysicalPropertiesObjectTree(window).getByTestId(`physicalPropertyColoring-${name}`);
}

// The row of a property, found by its coloring button (its title may be truncated). The button locator of `has` is
// Looked for inside each row: it starts from the page, not from the tree
function getPhysicalPropertyRow(window: Page, name: string): Locator {
  return getPhysicalPropertiesObjectTree(window)
    .getByTestId("treeRowWrapper")
    .filter({ has: window.getByTestId(`physicalPropertyColoring-${name}`) });
}

// Opens the given properties, by their name (e.g. "porosity")
async function expandPhysicalProperties(window: Page, names: string[]): Promise<void> {
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
  return getPhysicalPropertiesObjectTree(window).getByTestId(`physicalValue-${componentId}`);
}

// Colors the model by a property, by its name (e.g. "porosity"), or removes that coloring
async function togglePhysicalPropertyColoring(window: Page, name: string): Promise<void> {
  await closeAllMenus(window);
  await getPhysicalPropertyColoringButton(window, name).click();
  await moveMouseOutOfTheWay(window);
  await waitForActionSettled(window);
}

// Shows or hides the components carrying a property, from its eye
async function togglePhysicalPropertyVisibility(window: Page, name: string): Promise<void> {
  await closeAllMenus(window);
  const row = getPhysicalPropertyRow(window, name);
  await row
    .getByTestId("visibleObjectEyeButton")
    .or(row.getByTestId("hiddenObjectEyeButton"))
    .or(row.getByTestId("indeterminateObjectEyeButton"))
    .first()
    .click();
  await moveMouseOutOfTheWay(window);
  await waitForActionSettled(window);
}

export {
  expandPhysicalProperties,
  getPhysicalPropertiesObjectTree,
  getPhysicalPropertyColoringButton,
  getPhysicalPropertyRow,
  getPhysicalValue,
  openPhysicalPropertiesTree,
  togglePhysicalPropertyColoring,
  togglePhysicalPropertyVisibility,
};
