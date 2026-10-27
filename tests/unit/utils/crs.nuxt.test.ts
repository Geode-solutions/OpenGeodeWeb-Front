import { describe, expect, test, vi } from "vitest";
import { formatCrs, formatCrsCode } from "@ogw_front/utils/crs";

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
