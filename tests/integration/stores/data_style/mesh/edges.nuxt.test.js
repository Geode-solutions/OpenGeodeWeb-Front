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
const mesh_edges_schemas = viewer_schemas.opengeodeweb_viewer.mesh.edges;
const file_name = "test.og_edc3d";
const geode_object = "EdgedCurve3D";
const vertex_attribute = { name: "vertex_attribute" };
const edge_attribute = { name: "edge_attribute" };

let id = "",
  projectFolderPath = "";

describe("mesh edges", () => {
  beforeAll(async () => {
    ({ id, projectFolderPath } = await setupIntegrationTests(file_name, geode_object));
  }, beforeAllTimeout);

  afterAll(async () => {
    console.log("afterAll mesh edges kill", projectFolderPath);
    await cleanupBackend(projectFolderPath);
  });

  describe("edges", () => {
    test("edges visibility", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const visibility = true;
      const spy = vi.spyOn(viewerStore, "request");
      const result = dataStyleStore.setMeshEdgesVisibility(id, visibility);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(spy).toHaveBeenCalledWith(
        mesh_edges_schemas.visibility,
        { id, visibility },
        {
          response_function: expect.any(Function),
        },
      );
      expect(dataStyleStore.meshEdgesVisibility(id)).toBe(visibility);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("edges color red", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const color = { red: 255, green: 0, blue: 0, alpha: 1 };
      const spy = vi.spyOn(viewerStore, "request");
      const result = dataStyleStore.setMeshEdgesColor(id, color);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(spy).toHaveBeenCalledWith(
        mesh_edges_schemas.color,
        { id, color },
        {
          response_function: expect.any(Function),
        },
      );
      expect(dataStyleStore.meshEdgesColor(id)).toStrictEqual(color);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("edges vertex attribute", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();

      const spy = vi.spyOn(viewerStore, "request");
      await dataStyleStore.setMeshEdgesVertexAttributeName(id, vertex_attribute.name);
      expect(spy).toHaveBeenCalledWith(
        mesh_edges_schemas.attribute.vertex.name,
        { id, ...vertex_attribute },
        {
          response_function: expect.any(Function),
        },
      );
      expect(dataStyleStore.meshEdgesVertexAttributeName(id)).toBe(vertex_attribute.name);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("edges edge attribute", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();

      const spy = vi.spyOn(viewerStore, "request");
      await dataStyleStore.setMeshEdgesEdgeAttributeName(id, edge_attribute.name);
      expect(spy).toHaveBeenCalledWith(
        mesh_edges_schemas.attribute.edge.name,
        { id, ...edge_attribute },
        {
          response_function: expect.any(Function),
        },
      );
      expect(dataStyleStore.meshEdgesEdgeAttributeName(id)).toBe(edge_attribute.name);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("coloring color", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const coloringName = "color";
      const result = dataStyleStore.setMeshEdgesActiveColoring(id, coloringName);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(dataStyleStore.meshEdgesActiveColoring(id)).toBe(coloringName);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("coloring vertex", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      await dataStyleStore.setMeshEdgesVertexAttributeName(id, vertex_attribute.name);
      const coloringName = "vertex";
      const result = dataStyleStore.setMeshEdgesActiveColoring(id, coloringName);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(dataStyleStore.meshEdgesActiveColoring(id)).toBe(coloringName);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("coloring edge", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      await dataStyleStore.setMeshEdgesEdgeAttributeName(id, edge_attribute.name);
      const coloringName = "edge";
      const result = dataStyleStore.setMeshEdgesActiveColoring(id, coloringName);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(dataStyleStore.meshEdgesActiveColoring(id)).toBe(coloringName);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("edges apply style", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const result = dataStyleStore.applyMeshEdgesStyle(id);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });
});
