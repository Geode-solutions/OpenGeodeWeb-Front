import {
  BASEMAP_GROUP_ID,
  basemapGroup,
  isBasemapId,
  mapId,
  mapLayer,
  mapStyleOf,
  nextBasemapMaps,
  sortedMaps,
  withBasemapSelection,
} from "@ogw_front/utils/basemap_tree";
import { describe, expect, test } from "vitest";

describe("basemap tree", () => {
  test("one group with a child per map", () => {
    expect(basemapGroup()).toStrictEqual({
      id: "basemap",
      title: "Basemap",
      children: [
        { id: "basemap:satellite", title: "Satellite" },
        { id: "basemap:streets", title: "Streets" },
        { id: "basemap:topo", title: "Topo" },
      ],
    });
  });

  test("map ids are reserved for the basemap", () => {
    expect(mapStyleOf(mapId("topo"))).toBe("topo");
    expect(mapStyleOf(BASEMAP_GROUP_ID)).toBeUndefined();
    expect(mapStyleOf("basemap:unknown")).toBeUndefined();
  });

  test("basemap rows are never data rows", () => {
    expect(isBasemapId("basemap")).toBe(true);
    expect(isBasemapId("basemap:streets")).toBe(true);
    expect(isBasemapId("a1b2")).toBe(false);
  });

  test("the selection shows the visible maps", () => {
    const selection = ["a", "basemap:topo", "basemap"];
    expect(withBasemapSelection(selection, ["satellite", "streets"])).toStrictEqual([
      "a",
      "basemap:satellite",
      "basemap:streets",
    ]);
    expect(withBasemapSelection(["a", "basemap:topo"], [])).toStrictEqual(["a"]);
  });

  test("checking a map adds it, in the stacking order", () => {
    expect(nextBasemapMaps(["topo"], ["topo"], ["basemap:satellite"], [])).toStrictEqual([
      "satellite",
      "topo",
    ]);
    expect(nextBasemapMaps([], ["streets"], ["basemap:topo"], [])).toStrictEqual(["topo"]);
  });

  test("streets on top of topo, on top of satellite", () => {
    expect(sortedMaps(["streets", "satellite", "topo"])).toStrictEqual([
      "satellite",
      "topo",
      "streets",
    ]);
    expect(mapLayer("satellite")).toBe(0);
    expect(mapLayer("streets")).toBe(2);
  });

  test("unchecking a map hides that map only", () => {
    const both = ["satellite", "topo"] as const;
    expect(nextBasemapMaps(both, both, [], ["basemap:topo"])).toStrictEqual(["satellite"]);
    expect(nextBasemapMaps(["topo"], ["topo"], [], ["basemap:topo"])).toStrictEqual([]);
  });

  test("the group eye hides the visible maps and shows the last maps again", () => {
    // Classic tree: a click on the indeterminate group adds the group and every other map
    const others = ["basemap", "basemap:satellite", "basemap:streets"];
    expect(nextBasemapMaps(["topo"], ["topo"], others, [])).toStrictEqual([]);
    const all = [...others, "basemap:topo"];
    expect(nextBasemapMaps([], ["satellite", "topo"], all, [])).toStrictEqual([
      "satellite",
      "topo",
    ]);
    // Every map visible: the click unchecks them all
    const maps = ["basemap:satellite", "basemap:streets", "basemap:topo"];
    expect(nextBasemapMaps(["satellite", "streets", "topo"], [], [], maps)).toStrictEqual([]);
  });

  test("data changes keep the basemap", () => {
    expect(nextBasemapMaps(["topo"], ["topo"], ["a"], ["b"])).toStrictEqual(["topo"]);
  });
});
