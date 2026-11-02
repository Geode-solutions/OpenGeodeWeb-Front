import { describe, expect, test, vi } from "vitest";
import { formatCrs, formatCrsCode, oldestCrs, sameCrs } from "@ogw_front/utils/crs";
import type { DataItem } from "@ogw_front/stores/data";
import { mockAs } from "@ogw_tests/utils";

vi.setConfig({ testTimeout: 10_000 });

describe("format crs", () => {
  test("formats authority, code and name", () => {
    expect(formatCrs({ authority: "EPSG", code: "2154", name: "RGF93 v1 / Lambert-93" })).toBe(
      "EPSG:2154 — RGF93 v1 / Lambert-93",
    );
  });

  test("shows None without crs", () => {
    expect(formatCrs(undefined)).toBe("None");
  });

  test("formats the code alone", () => {
    expect(formatCrsCode({ authority: "EPSG", code: "2154", name: "RGF93 v1 / Lambert-93" })).toBe(
      "EPSG:2154",
    );
    expect(formatCrsCode(undefined)).toBe("None");
  });
});

const LAMBERT = { authority: "EPSG", code: "2154", name: "RGF93 v1 / Lambert-93" };
const UTM = { authority: "EPSG", code: "32631", name: "WGS 84 / UTM zone 31N" };

describe("same crs", () => {
  test("compares the authority and the code only", () => {
    expect(sameCrs(LAMBERT, { ...LAMBERT, name: "renamed" })).toBe(true);
    expect(sameCrs(LAMBERT, UTM)).toBe(false);
    expect(sameCrs(LAMBERT, undefined)).toBe(false);
    expect(sameCrs(undefined, undefined)).toBe(false);
  });
});

describe("oldest crs", () => {
  test("is the crs of the oldest georeferenced data", () => {
    const items = mockAs<DataItem[]>([
      { id: "local", created_at: "1" },
      { id: "utm", created_at: "3", crs: UTM },
      { id: "lambert", created_at: "2", crs: LAMBERT },
    ]);
    expect(oldestCrs(items)).toStrictEqual(LAMBERT);
    expect(oldestCrs([])).toBeUndefined();
  });
});
