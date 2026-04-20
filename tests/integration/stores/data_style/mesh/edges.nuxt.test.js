// Third party imports
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json" with { type: "json" };

// Local imports
import { Status } from "@ogw_front/utils/status";
import { cleanupBackend } from "@ogw_front/utils/local/cleanup";
import { setupIntegrationTests } from "@ogw_tests/integration/setup";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const INTERVAL_TIMEOUT = 25_000;
const mesh_edges_schemas = viewer_schemas.opengeodeweb_viewer.mesh.edges;
const file_name = "test.og_edc3d";
const geode_object = "EdgedCurve3D";
const vertex_attribute = { name: "vertex_attribute" };
const edge_attribute = { name: "edge_attribute" };

let id = "",
  projectFolderPath = "";

beforeAll(async () => {
  ({ id, projectFolderPath } = await setupIntegrationTests(file_name, geode_object));
}, INTERVAL_TIMEOUT);

afterAll(async () => {
  console.log("afterAll mesh edges kill", projectFolderPath);
  await cleanupBackend(projectFolderPath);
});

describe("Mesh edges", () => {
  describe("Edges", () => {
    test("Edges visibility", async () => {
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

    test("Edges color red", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const color = { r: 255, g: 0, b: 0, a: 1 };
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

    test("Edges vertex attribute", async () => {
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

    test("Edges edge attribute", async () => {
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

    test("Edges active coloring", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const coloringTypes = [
        { name: "color" },
        {
          name: "vertex",
          function: () => dataStyleStore.setMeshEdgesVertexAttributeName(id, vertex_attribute.name),
        },
        {
          name: "edge",
          function: () => dataStyleStore.setMeshEdgesEdgeAttributeName(id, edge_attribute.name),
        },
      ];
      async function testColoring(coloringType) {
        if (coloringType.function) {
          await coloringType.function();
        }
        const result = dataStyleStore.setMeshEdgesActiveColoring(id, coloringType.name);
        expect(result).toBeInstanceOf(Promise);
        await result;
        expect(dataStyleStore.meshEdgesActiveColoring(id)).toBe(coloringType.name);
        expect(viewerStore.status).toBe(Status.CONNECTED);
      }

      await testColoring(coloringTypes[0]);
      await testColoring(coloringTypes[1]);
      await testColoring(coloringTypes[2]);
    });
    test("Edges apply style", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const result = dataStyleStore.applyMeshEdgesStyle(id);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });
});
