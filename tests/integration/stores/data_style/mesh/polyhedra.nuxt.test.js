// Third party imports
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json" with { type: "json" };

// Local imports
import { Status } from "@ogw_front/utils/status";
import { cleanupBackend } from "@ogw_front/utils/local/cleanup";
import { beforeAllTimeout, setupIntegrationTests } from "@ogw_tests/integration/setup";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const mesh_polyhedra_schemas = viewer_schemas.opengeodeweb_viewer.mesh.polyhedra;
const file_name = "test.vtu";
const geode_object = "HybridSolid3D";
const vertex_attribute = { name: "toto_on_vertices" };
const polyhedron_attribute = { name: "toto_on_polyhedra" };

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
      expect(spy).toHaveBeenCalledWith(
        mesh_polyhedra_schemas.visibility,
        { id, visibility },
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
      expect(spy).toHaveBeenCalledWith(
        mesh_polyhedra_schemas.color,
        { id, color },
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
      const coloringName = "color";
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

  test("polyhedra vertex attribute", async () => {
    const dataStyleStore = useDataStyleStore();
    const viewerStore = useViewerStore();

    const spy = vi.spyOn(viewerStore, "request");
    await dataStyleStore.setMeshPolyhedraVertexAttributeName(id, vertex_attribute.name);
    expect(spy).toHaveBeenCalledWith(
      mesh_polyhedra_schemas.attribute.vertex.name,
      { id, ...vertex_attribute },
      {
        response_function: expect.any(Function),
      },
    );
    expect(dataStyleStore.meshPolyhedraVertexAttributeName(id)).toBe(vertex_attribute.name);
    expect(viewerStore.status).toBe(Status.CONNECTED);
  });

  test("polyhedra polyhedron attribute", async () => {
    const dataStyleStore = useDataStyleStore();
    const viewerStore = useViewerStore();

    const spy = vi.spyOn(viewerStore, "request");
    await dataStyleStore.setMeshPolyhedraPolyhedronAttributeName(id, polyhedron_attribute.name);
    expect(spy).toHaveBeenCalledWith(
      mesh_polyhedra_schemas.attribute.polyhedron.name,
      { id, ...polyhedron_attribute },
      {
        response_function: expect.any(Function),
      },
    );
    expect(dataStyleStore.meshPolyhedraPolyhedronAttributeName(id)).toBe(polyhedron_attribute.name);
    expect(viewerStore.status).toBe(Status.CONNECTED);
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
