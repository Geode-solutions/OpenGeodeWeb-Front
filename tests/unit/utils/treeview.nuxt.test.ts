// Third party imports
import { describe, expect, test, vi } from "vitest";

// Local imports
import { withPendingImports } from "@ogw_front/utils/treeview";

vi.setConfig({ testTimeout: 10_000 });

const surface = { id: "surface", title: "surface" };
const surfaces = { id: "PolygonalSurface3D", title: "PolygonalSurface3D", children: [surface] };

function pending(
  id: string,
  geode_object_type: "PolygonalSurface3D" | "BRep",
): { id: string; title: string; geode_object_type: "PolygonalSurface3D" | "BRep" } {
  return { id, title: `${id}.file`, geode_object_type };
}

describe("files being imported in the tree", () => {
  test("leaves the groups as they are without pending import", () => {
    expect(withPendingImports([surfaces], [])).toStrictEqual([surfaces]);
  });

  test("lists a pending file in the group of its type", () => {
    const merged = withPendingImports([surfaces], [pending("new", "PolygonalSurface3D")]);
    expect(merged).toStrictEqual([
      { ...surfaces, children: [surface, pending("new", "PolygonalSurface3D")] },
    ]);
    // The store's group is not changed
    expect(surfaces.children).toStrictEqual([surface]);
  });

  test("creates the group of a type without data yet", () => {
    const merged = withPendingImports([surfaces], [pending("model", "BRep")]);
    expect(merged).toStrictEqual([
      surfaces,
      { id: "BRep", title: "BRep", children: [pending("model", "BRep")] },
    ]);
  });
});
