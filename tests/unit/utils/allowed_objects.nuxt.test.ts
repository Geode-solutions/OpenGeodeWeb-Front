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
      [{ SolidMesh3D: { is_loadable: LOADABLE } }, { BRep: { is_loadable: LOADABLE } }],
    );
    expect(resolved.map((file) => file.selectedGeodeObject)).toStrictEqual(["SolidMesh3D", "BRep"]);
  });

  test("leaves an ambiguous file unselected, with its candidates sorted best first", () => {
    const [resolved] = resolveAllowedObjectsPerFile(
      ["surface.vtp"],
      [
        {
          PolygonalSurface3D: { is_loadable: LESS_LOADABLE },
          TriangulatedSurface3D: { is_loadable: LOADABLE, object_priority: 1 },
          HybridSolid3D: { is_loadable: LOADABLE, object_priority: 1 },
        },
      ],
    );
    expect(resolved?.selectedGeodeObject).toBeUndefined();
    expect(resolved?.candidates.at(-1)).toBe("PolygonalSurface3D");
  });

  test("gives no candidate to a file that cannot be loaded", () => {
    const [resolved] = resolveAllowedObjectsPerFile(
      ["broken.vtu"],
      [{ SolidMesh3D: { is_loadable: NOT_LOADABLE } }],
    );
    expect(resolved?.candidates).toStrictEqual([]);
    expect(resolved?.selectedGeodeObject).toBeUndefined();
  });

  test("gives no candidate to an unsupported file", () => {
    const [resolved] = resolveAllowedObjectsPerFile(["file.toto"], [{}]);
    expect(resolved?.candidates).toStrictEqual([]);
  });
});
