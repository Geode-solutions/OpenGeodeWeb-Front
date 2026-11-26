import { describe, expect, test, vi } from "vitest";
import { isMesh, isModel } from "@ogw_front/utils/viewer_object_type";

vi.setConfig({ testTimeout: 10_000 });

describe("viewer object type", () => {
  test("isModel is true only for models", () => {
    expect(isModel({ viewer_object_type: "model" })).toBe(true);
    expect(isModel({ viewer_object_type: "mesh" })).toBe(false);
  });

  test("isMesh is true only for meshes", () => {
    expect(isMesh({ viewer_object_type: "mesh" })).toBe(true);
    expect(isMesh({ viewer_object_type: "model" })).toBe(false);
  });
});
