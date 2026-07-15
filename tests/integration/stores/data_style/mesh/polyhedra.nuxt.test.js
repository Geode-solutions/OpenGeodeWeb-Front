// Third party imports
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json" with { type: "json" };

// Local imports
import { beforeAllTimeout, setupIntegrationTests } from "@ogw_tests/integration/setup";
import { Status } from "@ogw_front/utils/status";
import { cleanupBackend } from "@ogw_front/utils/local/cleanup";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const mesh_polyhedra_schemas = viewer_schemas.opengeodeweb_viewer.mesh.polyhedra;
const file_name = "test.vtu";
const geode_object = "HybridSolid3D";
const vertex_attribute = { name: "toto_on_vertices", item: 0 };
const polyhedron_attribute = { name: "toto_on_polyhedra", item: 0 };
const MINIMUM_RANGE = 10;
const MAXIMUM_RANGE = 20;

let id = "",
  projectFolderPath = "";

describe("mesh polyhedra", () => {
  beforeAll(async () => {
    ({ id, projectFolderPath } = await setupIntegrationTests(file_name, geode_object));
  }, beforeAllTimeout);

  afterAll(async () => {
    console.log("afterAll mesh cells kill", projectFolderPath);
    await cleanupBackend(projectFolderPath);
  });

  describe("polyhedra", () => {
    test("polyhedra visibility", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const visibility = true;
      const spy = vi.spyOn(viewerStore, "request");
      const result = dataStyleStore.setMeshPolyhedraVisibility(id, visibility);
      expect(result).toBeInstanceOf(Promise);
      await result;
      const schema = mesh_polyhedra_schemas.visibility;
      const params = { id, visibility };
      expect(spy).toHaveBeenCalledWith(
        { schema, params },
        {
          response_function: expect.any(Function),
        },
      );
      expect(dataStyleStore.meshPolyhedraVisibility(id)).toBe(visibility);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("polyhedra color red", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const color = { red: 255, green: 0, blue: 0, alpha: 1 };
      const spy = vi.spyOn(viewerStore, "request");
      const result = dataStyleStore.setMeshPolyhedraColor(id, color);
      expect(result).toBeInstanceOf(Promise);
      await result;
      const schema = mesh_polyhedra_schemas.color;
      const params = { id, color };
      expect(spy).toHaveBeenCalledWith(
        { schema, params },
        {
          response_function: expect.any(Function),
        },
      );
      expect(dataStyleStore.meshPolyhedraColor(id)).toStrictEqual(color);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("coloring color", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const coloringName = "constant";
      const result = dataStyleStore.setMeshPolyhedraActiveColoring(id, coloringName);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(dataStyleStore.meshPolyhedraActiveColoring(id)).toBe(coloringName);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("coloring vertex", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      await dataStyleStore.setMeshPolyhedraVertexAttributeName(id, vertex_attribute.name);
      const coloringName = "vertex";
      const result = dataStyleStore.setMeshPolyhedraActiveColoring(id, coloringName);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(dataStyleStore.meshPolyhedraActiveColoring(id)).toBe(coloringName);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("coloring polyhedron", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      await dataStyleStore.setMeshPolyhedraPolyhedronAttributeName(id, polyhedron_attribute.name);
      const coloringName = "polyhedron";
      const result = dataStyleStore.setMeshPolyhedraActiveColoring(id, coloringName);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(dataStyleStore.meshPolyhedraActiveColoring(id)).toBe(coloringName);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });

  describe("polyhedra vertex attribute", () => {
    test("coloring vertex attribute", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();

      const spy = vi.spyOn(viewerStore, "request");
      await dataStyleStore.setMeshPolyhedraVertexAttributeName(id, vertex_attribute.name);
      const schema = mesh_polyhedra_schemas.attribute.vertex.name;
      const params = { id, ...vertex_attribute };
      expect(spy).toHaveBeenCalledWith(
        { schema, params },
        {
          response_function: expect.any(Function),
        },
      );
      expect(dataStyleStore.meshPolyhedraVertexAttributeName(id)).toBe(vertex_attribute.name);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("stored configs 1 - select attribute points and item 2", async () => {
      const dataStyleStore = useDataStyleStore();
      await dataStyleStore.setMeshPolyhedraVertexAttributeName(id, "points");
      await dataStyleStore.setMeshPolyhedraVertexAttributeItem(id, 2);
      expect(dataStyleStore.meshPolyhedraVertexAttributeName(id)).toBe("points");
      expect(dataStyleStore.meshPolyhedraVertexAttributeItem(id)).toBe(2);
    });

    test("stored configs 2 - set range and colormap", async () => {
      const dataStyleStore = useDataStyleStore();
      await dataStyleStore.setMeshPolyhedraVertexAttributeRange(id, MINIMUM_RANGE, MAXIMUM_RANGE);
      await dataStyleStore.setMeshPolyhedraVertexAttributeColorMap(id, "discrete:budaS");
      expect(dataStyleStore.meshPolyhedraVertexAttributeRange(id)).toStrictEqual([
        MINIMUM_RANGE,
        MAXIMUM_RANGE,
      ]);
      expect(dataStyleStore.meshPolyhedraVertexAttributeColorMap(id)).toBe("discrete:budaS");
    });

    test("stored configs 3 - select polyhedra_around_vertex", async () => {
      const dataStyleStore = useDataStyleStore();
      await dataStyleStore.setMeshPolyhedraVertexAttributeName(id, "polyhedra_around_vertex");
      await dataStyleStore.setMeshPolyhedraVertexAttributeItem(id, 0);
      expect(dataStyleStore.meshPolyhedraVertexAttributeName(id)).toBe("polyhedra_around_vertex");
      expect(dataStyleStore.meshPolyhedraVertexAttributeItem(id)).toBe(0);
    });

    test("stored configs 4 - switch back to points and verify restoration", async () => {
      const dataStyleStore = useDataStyleStore();
      await dataStyleStore.setMeshPolyhedraVertexAttributeName(id, "points");
      expect(dataStyleStore.meshPolyhedraVertexAttributeName(id)).toBe("points");
      expect(dataStyleStore.meshPolyhedraVertexAttributeItem(id)).toBe(2);
      expect(dataStyleStore.meshPolyhedraVertexAttributeRange(id)).toStrictEqual([
        MINIMUM_RANGE,
        MAXIMUM_RANGE,
      ]);
      expect(dataStyleStore.meshPolyhedraVertexAttributeColorMap(id)).toBe("discrete:budaS");
    });
  });

  describe("polyhedra polyhedron attribute", () => {
    test("polyhedra polyhedron attribute", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();

      const spy = vi.spyOn(viewerStore, "request");
      await dataStyleStore.setMeshPolyhedraPolyhedronAttributeName(id, polyhedron_attribute.name);
      const schema = mesh_polyhedra_schemas.attribute.polyhedron.name;
      const params = { id, ...polyhedron_attribute };
      expect(spy).toHaveBeenCalledWith(
        { schema, params },
        {
          response_function: expect.any(Function),
        },
      );
      expect(dataStyleStore.meshPolyhedraPolyhedronAttributeName(id)).toBe(
        polyhedron_attribute.name,
      );
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("stored configs 1 - select attribute tetrahedron_vertices and item 2", async () => {
      const dataStyleStore = useDataStyleStore();
      await dataStyleStore.setMeshPolyhedraPolyhedronAttributeName(id, "tetrahedron_vertices");
      await dataStyleStore.setMeshPolyhedraPolyhedronAttributeItem(id, 2);
      expect(dataStyleStore.meshPolyhedraPolyhedronAttributeName(id)).toBe("tetrahedron_vertices");
      expect(dataStyleStore.meshPolyhedraPolyhedronAttributeItem(id)).toBe(2);
    });

    test("stored configs 2 - set range and colormap", async () => {
      const dataStyleStore = useDataStyleStore();
      await dataStyleStore.setMeshPolyhedraPolyhedronAttributeRange(
        id,
        MINIMUM_RANGE,
        MAXIMUM_RANGE,
      );
      await dataStyleStore.setMeshPolyhedraPolyhedronAttributeColorMap(id, "discrete:budaS");
      expect(dataStyleStore.meshPolyhedraPolyhedronAttributeRange(id)).toStrictEqual([
        MINIMUM_RANGE,
        MAXIMUM_RANGE,
      ]);
      expect(dataStyleStore.meshPolyhedraPolyhedronAttributeColorMap(id)).toBe("discrete:budaS");
    });

    test("stored configs 3 - select tetrahedron_adjacents", async () => {
      const dataStyleStore = useDataStyleStore();
      await dataStyleStore.setMeshPolyhedraPolyhedronAttributeName(id, "tetrahedron_adjacents");
      await dataStyleStore.setMeshPolyhedraPolyhedronAttributeItem(id, 0);
      expect(dataStyleStore.meshPolyhedraPolyhedronAttributeName(id)).toBe("tetrahedron_adjacents");
      expect(dataStyleStore.meshPolyhedraPolyhedronAttributeItem(id)).toBe(0);
    });

    test("stored configs 4 - switch back to tetrahedron_vertices and verify restoration", async () => {
      const dataStyleStore = useDataStyleStore();
      await dataStyleStore.setMeshPolyhedraPolyhedronAttributeName(id, "tetrahedron_vertices");
      expect(dataStyleStore.meshPolyhedraPolyhedronAttributeName(id)).toBe("tetrahedron_vertices");
      expect(dataStyleStore.meshPolyhedraPolyhedronAttributeItem(id)).toBe(2);
      expect(dataStyleStore.meshPolyhedraPolyhedronAttributeRange(id)).toStrictEqual([
        MINIMUM_RANGE,
        MAXIMUM_RANGE,
      ]);
      expect(dataStyleStore.meshPolyhedraPolyhedronAttributeColorMap(id)).toBe("discrete:budaS");
    });
  });

  test("polyhedra apply default style", async () => {
    const dataStyleStore = useDataStyleStore();
    const viewerStore = useViewerStore();
    const result = dataStyleStore.applyMeshPolyhedraStyle(id);
    expect(result).toBeInstanceOf(Promise);
    await result;
    expect(viewerStore.status).toBe(Status.CONNECTED);
  });
});
