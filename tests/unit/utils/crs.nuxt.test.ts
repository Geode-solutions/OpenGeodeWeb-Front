import { describe, expect, test, vi } from "vitest";
import { formatCrs, formatCrsCode, projectCrs } from "@ogw_front/utils/crs";
import type { DataItem } from "@ogw_front/stores/data";

vi.setConfig({ testTimeout: 10_000 });

const LAMBERT = { authority: "EPSG", code: "2154", name: "RGF93 v1 / Lambert-93" };
const UTM = { authority: "EPSG", code: "32631", name: "WGS 84 / UTM zone 31N" };

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

describe("project crs", () => {
  test("is the crs of the oldest georeferenced data", () => {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const items = [
      { id: "b", created_at: "2", crs: UTM },
      { id: "a", created_at: "1" },
      { id: "c", created_at: "0", crs: LAMBERT },
    ] as unknown as DataItem[];
    expect(projectCrs(items)).toStrictEqual(LAMBERT);
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const noCrs = [{ id: "a", created_at: "1" }] as unknown as DataItem[];
    expect(projectCrs(noCrs)).toBeUndefined();
  });
});
