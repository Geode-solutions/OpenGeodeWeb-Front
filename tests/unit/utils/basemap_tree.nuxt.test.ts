import {
  BASEMAP_GROUP_ID,
  basemapGroup,
  isBasemapId,
  mapId,
  mapStyleOf,
  nextBasemapMaps,
  sortedMaps,
} from "@ogw_front/utils/basemap_tree";
import { describe, expect, test } from "vitest";

describe("basemap tree", () => {
  test("one group with a child per map", () => {
    expect(basemapGroup()).toStrictEqual({
      id: "basemap",
      title: "Basemap",
      children: [
        { id: "basemap:satellite", title: "Satellite" },
        { id: "basemap:plan", title: "Plan" },
        { id: "basemap:routes", title: "Routes" },
      ],
    });
  });

  test("map ids are reserved for the basemap", () => {
    expect(mapStyleOf(mapId("routes"))).toBe("routes");
    expect(mapStyleOf(BASEMAP_GROUP_ID)).toBeUndefined();
    expect(mapStyleOf("basemap:unknown")).toBeUndefined();
  });

  test("basemap rows are never data rows", () => {
    expect(isBasemapId("basemap")).toBe(true);
    expect(isBasemapId("basemap:plan")).toBe(true);
    expect(isBasemapId("a1b2")).toBe(false);
  });

  test("checking a map adds it, in the stacking order", () => {
    expect(nextBasemapMaps(["routes"], ["routes"], ["basemap:satellite"], [])).toStrictEqual([
      "satellite",
      "routes",
    ]);
    expect(nextBasemapMaps([], ["plan"], ["basemap:routes"], [])).toStrictEqual(["routes"]);
  });

  test("routes on top of plan, on top of satellite", () => {
    expect(sortedMaps(["routes", "satellite", "plan"])).toStrictEqual([
      "satellite",
      "plan",
      "routes",
    ]);
  });

  test("unchecking a map hides that map only", () => {
    const both = ["satellite", "routes"] as const;
    expect(nextBasemapMaps(both, both, [], ["basemap:routes"])).toStrictEqual(["satellite"]);
    expect(nextBasemapMaps(["routes"], ["routes"], [], ["basemap:routes"])).toStrictEqual([]);
  });

  test("the group eye hides the visible maps and shows the last maps again", () => {
    // Classic tree: a click on the indeterminate group adds the group and every other map
    const others = ["basemap", "basemap:satellite", "basemap:plan"];
    expect(nextBasemapMaps(["routes"], ["routes"], others, [])).toStrictEqual([]);
    const all = [...others, "basemap:routes"];
    expect(nextBasemapMaps([], ["satellite", "routes"], all, [])).toStrictEqual([
      "satellite",
      "routes",
    ]);
    // Every map visible: the click unchecks them all
    const maps = ["basemap:satellite", "basemap:plan", "basemap:routes"];
    expect(nextBasemapMaps(["satellite", "plan", "routes"], [], [], maps)).toStrictEqual([]);
  });

  test("data changes keep the basemap", () => {
    expect(nextBasemapMaps(["routes"], ["routes"], ["a"], ["b"])).toStrictEqual(["routes"]);
  });
});
