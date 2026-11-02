import { describe, expect, test } from "vitest";
import { setupActivePinia } from "@ogw_tests/utils";
import { useMenuStore } from "@ogw_front/stores/menu";

// Names rather than components: importing the components here would load them before the store
function componentNames(components: readonly unknown[]): unknown[] {
  // oxlint-disable-next-line no-underscore-dangle, no-unsafe-type-assertion -- the SFC name set by the compiler
  return components.map((component) => (component as { __name?: string }).__name);
}

describe("menu store", () => {
  test("registers the basemap menus", () => {
    setupActivePinia();
    const menuStore = useMenuStore();
    expect(componentNames(menuStore.getMenuItems("basemap", "Map"))).toStrictEqual([
      "ViewerBasemapOpacityOptions",
    ]);
    expect(componentNames(menuStore.getMenuItems("basemap", "Basemap"))).toStrictEqual([
      "ViewerBasemapAroundOptions",
    ]);
  });
});
