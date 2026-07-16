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
const mesh_edges_schemas = viewer_schemas.opengeodeweb_viewer.mesh.edges;
const file_name = "test.og_edc3d";
const geode_object = "EdgedCurve3D";
const MINIMUM_RANGE = 10;
const MAXIMUM_RANGE = 20;
const range = [MINIMUM_RANGE, MAXIMUM_RANGE];
const default_vertex_attribute = { name: "vertex_attribute", item: 0, range };
const default_edge_attribute = { name: "edge_attribute", item: 0, range };

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
      const schema = mesh_edges_schemas.visibility;
      const params = { id, visibility };
      expect(spy).toHaveBeenCalledWith(
        { schema, params },
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
      const schema = mesh_edges_schemas.color;
      const params = { id, color };
      expect(spy).toHaveBeenCalledWith(
        { schema, params },
        {
          response_function: expect.any(Function),
        },
      );
      expect(dataStyleStore.meshEdgesColor(id)).toStrictEqual(color);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    describe("edges vertex attribute", () => {
      test("coloring vertex attribute", async () => {
        const dataStyleStore = useDataStyleStore();
        const viewerStore = useViewerStore();

        const spy = vi.spyOn(viewerStore, "request");
        const vertex_attribute = { name: "vertex_attribute", item: 0 };
        await dataStyleStore.setMeshEdgesVertexAttributeName(id, vertex_attribute.name);
        const schema = mesh_edges_schemas.attribute.vertex.name;
        const params = { id, name: vertex_attribute.name, item: vertex_attribute.item };
        expect(spy).toHaveBeenCalledWith(
          { schema, params },
          {
            response_function: expect.any(Function),
          },
        );
        expect(dataStyleStore.meshEdgesVertexAttributeName(id)).toBe(vertex_attribute.name);
        expect(viewerStore.status).toBe(Status.CONNECTED);
      });

      test("stored configs 1 - select attribute points and item 2", async () => {
        const dataStyleStore = useDataStyleStore();
        const vertex_attribute = { name: "points", item: 2 };
        await dataStyleStore.setMeshEdgesVertexAttributeName(id, vertex_attribute.name);
        await dataStyleStore.setMeshEdgesVertexAttributeItem(id, vertex_attribute.item);
        expect(dataStyleStore.meshEdgesVertexAttributeName(id)).toBe(vertex_attribute.name);
        expect(dataStyleStore.meshEdgesVertexAttributeItem(id)).toBe(vertex_attribute.item);
      });

      test("stored configs 2 - set range and colormap", async () => {
        const dataStyleStore = useDataStyleStore();
        await dataStyleStore.setMeshEdgesVertexAttributeRange(id, range[0], range[1]);
        await dataStyleStore.setMeshEdgesVertexAttributeColorMap(id, "discrete:budaS");
        expect(dataStyleStore.meshEdgesVertexAttributeRange(id)).toStrictEqual(range);
        expect(dataStyleStore.meshEdgesVertexAttributeColorMap(id)).toBe("discrete:budaS");
      });

      test("stored configs 3 - select edges_around_vertex", async () => {
        const dataStyleStore = useDataStyleStore();
        await dataStyleStore.setMeshEdgesVertexAttributeName(id, "edges_around_vertex");
        await dataStyleStore.setMeshEdgesVertexAttributeItem(id, 0);
        expect(dataStyleStore.meshEdgesVertexAttributeName(id)).toBe("edges_around_vertex");
        expect(dataStyleStore.meshEdgesVertexAttributeItem(id)).toBe(0);
      });

      test("stored configs 4 - switch back to points and verify restoration", async () => {
        const dataStyleStore = useDataStyleStore();
        const vertex_attribute = { name: "points", item: 2 };
        await dataStyleStore.setMeshEdgesVertexAttributeName(id, vertex_attribute.name);
        expect(dataStyleStore.meshEdgesVertexAttributeName(id)).toBe(vertex_attribute.name);
        expect(dataStyleStore.meshEdgesVertexAttributeItem(id)).toBe(vertex_attribute.item);
        expect(dataStyleStore.meshEdgesVertexAttributeRange(id)).toStrictEqual(range);
        expect(dataStyleStore.meshEdgesVertexAttributeColorMap(id)).toBe("discrete:budaS");
      });
    });

    describe("edges edge attribute", () => {
      test("coloring edge attribute", async () => {
        const dataStyleStore = useDataStyleStore();
        const viewerStore = useViewerStore();

        const spy = vi.spyOn(viewerStore, "request");
        const edge_attribute = { name: "edge_attribute", item: 0 };
        await dataStyleStore.setMeshEdgesEdgeAttributeName(id, edge_attribute.name);
        const schema = mesh_edges_schemas.attribute.edge.name;
        const params = { id, name: edge_attribute.name, item: edge_attribute.item };
        expect(spy).toHaveBeenCalledWith(
          { schema, params },
          {
            response_function: expect.any(Function),
          },
        );
        expect(dataStyleStore.meshEdgesEdgeAttributeName(id)).toBe(edge_attribute.name);
        expect(viewerStore.status).toBe(Status.CONNECTED);
      });

      test("stored configs 1 - select attribute edges and item 2", async () => {
        const dataStyleStore = useDataStyleStore();
        const edge_attribute = { name: "edges", item: 2 };
        await dataStyleStore.setMeshEdgesEdgeAttributeName(id, edge_attribute.name);
        await dataStyleStore.setMeshEdgesEdgeAttributeItem(id, edge_attribute.item);
        expect(dataStyleStore.meshEdgesEdgeAttributeName(id)).toBe(edge_attribute.name);
        expect(dataStyleStore.meshEdgesEdgeAttributeItem(id)).toBe(edge_attribute.item);
      });

      test("stored configs 2 - set range and colormap", async () => {
        const dataStyleStore = useDataStyleStore();
        await dataStyleStore.setMeshEdgesEdgeAttributeRange(id, range[0], range[1]);
        await dataStyleStore.setMeshEdgesEdgeAttributeColorMap(id, "discrete:budaS");
        expect(dataStyleStore.meshEdgesEdgeAttributeRange(id)).toStrictEqual(range);
        expect(dataStyleStore.meshEdgesEdgeAttributeColorMap(id)).toBe("discrete:budaS");
      });

      test("stored configs 3 - select cycle_id", async () => {
        const dataStyleStore = useDataStyleStore();
        await dataStyleStore.setMeshEdgesEdgeAttributeName(id, "cycle_id");
        await dataStyleStore.setMeshEdgesEdgeAttributeItem(id, 0);
        expect(dataStyleStore.meshEdgesEdgeAttributeName(id)).toBe("cycle_id");
        expect(dataStyleStore.meshEdgesEdgeAttributeItem(id)).toBe(0);
      });

      test("stored configs 4 - switch back to edges and verify restoration", async () => {
        const dataStyleStore = useDataStyleStore();
        const edge_attribute = { name: "edges", item: 2 };
        await dataStyleStore.setMeshEdgesEdgeAttributeName(id, edge_attribute.name);
        expect(dataStyleStore.meshEdgesEdgeAttributeName(id)).toBe(edge_attribute.name);
        expect(dataStyleStore.meshEdgesEdgeAttributeItem(id)).toBe(edge_attribute.item);
        expect(dataStyleStore.meshEdgesEdgeAttributeRange(id)).toStrictEqual(range);
        expect(dataStyleStore.meshEdgesEdgeAttributeColorMap(id)).toBe("discrete:budaS");
      });
    });

    test("coloring color", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const coloringName = "constant";
      const result = dataStyleStore.setMeshEdgesActiveColoring(id, coloringName);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(dataStyleStore.meshEdgesActiveColoring(id)).toBe(coloringName);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("coloring vertex", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      await dataStyleStore.setMeshEdgesVertexAttributeName(id, default_vertex_attribute.name);
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
      await dataStyleStore.setMeshEdgesEdgeAttributeName(id, default_edge_attribute.name);
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
