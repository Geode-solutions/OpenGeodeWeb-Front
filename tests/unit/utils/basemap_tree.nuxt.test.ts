import {
  BASEMAP_GROUP_ID,
  basemapGroup,
  isBasemapId,
  mapId,
  mapStyleOf,
  nextBasemapStyle,
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

  test("the selection shows the visible map only", () => {
    expect(withBasemapSelection(["a", "basemap:topo", "basemap"], "streets")).toStrictEqual([
      "a",
      "basemap:streets",
    ]);
    expect(withBasemapSelection(["a", "basemap:topo"], "none")).toStrictEqual(["a"]);
  });

  test("checking a map shows it alone", () => {
    expect(nextBasemapStyle("satellite", "satellite", ["basemap:topo"], [])).toBe("topo");
    expect(nextBasemapStyle("none", "streets", ["basemap:topo"], [])).toBe("topo");
  });

  test("unchecking the visible map hides the basemap", () => {
    expect(nextBasemapStyle("topo", "topo", [], ["basemap:topo"])).toBe("none");
  });

  test("the group eye hides a visible basemap and shows the last map again", () => {
    // Classic tree: a click on the indeterminate group adds the group and every map
    const all = ["basemap", "basemap:satellite", "basemap:streets"];
    expect(nextBasemapStyle("topo", "topo", all, [])).toBe("none");
    expect(nextBasemapStyle("none", "streets", [...all, "basemap:topo"], [])).toBe("streets");
  });

  test("data changes keep the basemap", () => {
    expect(nextBasemapStyle("topo", "topo", ["a"], ["b"])).toBe("topo");
  });
});
