// Third party imports
import { describe, expect, test } from "vitest";

// Local imports
import { resolveAllowedObjectsPerFile } from "@ogw_shared/utils/response_handlers/load";

const LOADABLE = 1;
const LESS_LOADABLE = 0.5;
const NOT_LOADABLE = 0;

describe("resolve allowed objects per file", () => {
  test("gives each file its own type when files share none", () => {
    const resolved = resolveAllowedObjectsPerFile(
      ["mesh.vtu", "model.og_brep"],
      [
        {
          allowed_objects: { SolidMesh3D: { is_loadable: LOADABLE } },
          objects_to_load: ["SolidMesh3D"],
        },
        { allowed_objects: { BRep: { is_loadable: LOADABLE } }, objects_to_load: ["BRep"] },
      ],
    );
    expect(resolved.map((file) => file.selectedGeodeObjects)).toStrictEqual([
      ["SolidMesh3D"],
      ["BRep"],
    ]);
  });

  test("selects every type the backend loads for a mixed file", () => {
    const [resolved] = resolveAllowedObjectsPerFile(
      ["mesh.vtu"],
      [
        {
          allowed_objects: {
            TriangulatedSurface3D: { is_loadable: LOADABLE, loadable_family: "SurfaceMesh" },
            TetrahedralSolid3D: { is_loadable: LOADABLE, loadable_family: "SolidMesh" },
          },
          objects_to_load: ["TriangulatedSurface3D", "TetrahedralSolid3D"],
        },
      ],
    );
    expect(resolved?.selectedGeodeObjects).toStrictEqual([
      "TriangulatedSurface3D",
      "TetrahedralSolid3D",
    ]);
  });

  test("leaves an ambiguous file unselected, with its candidates sorted best first", () => {
    const [resolved] = resolveAllowedObjectsPerFile(
      ["surface.vtp"],
      [
        {
          allowed_objects: {
            PolygonalSurface3D: { is_loadable: LESS_LOADABLE },
            TriangulatedSurface3D: { is_loadable: LOADABLE, object_priority: 1 },
            HybridSolid3D: { is_loadable: LOADABLE, object_priority: 1 },
          },
          objects_to_load: [],
        },
      ],
    );
    expect(resolved?.selectedGeodeObjects).toStrictEqual([]);
    expect(resolved?.candidates.at(-1)).toBe("PolygonalSurface3D");
  });

  test("gives no candidate to a file that cannot be loaded", () => {
    const [resolved] = resolveAllowedObjectsPerFile(
      ["broken.vtu"],
      [{ allowed_objects: { SolidMesh3D: { is_loadable: NOT_LOADABLE } }, objects_to_load: [] }],
    );
    expect(resolved?.candidates).toStrictEqual([]);
    expect(resolved?.selectedGeodeObjects).toStrictEqual([]);
  });

  test("gives no candidate to an unsupported file", () => {
    const [resolved] = resolveAllowedObjectsPerFile(
      ["file.toto"],
      [{ allowed_objects: {}, objects_to_load: [] }],
    );
    expect(resolved?.candidates).toStrictEqual([]);
  });
});
