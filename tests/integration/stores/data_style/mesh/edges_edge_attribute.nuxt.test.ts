// Third party imports
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

// Local imports
import { beforeAllTimeout, setupIntegrationTests } from "@ogw_tests/integration/setup";
import {
  default_edge_attribute,
  default_vertex_attribute,
  file_name,
  geode_object,
  mesh_edges_schemas,
  range,
} from "@ogw_tests/integration/stores/data_style/mesh/edges_helpers";
import { DEFAULT_NO_DATA_COLOR } from "@ogw_front/utils/default_styles/constants";
import { Status } from "@ogw_front/utils/status";
import { cleanupBackend } from "@ogw_server/utils/cleanup";
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useViewerStore } from "@ogw_front/stores/viewer";

let id = "";
let projectFolderPath = "";

describe("mesh edges", () => {
  beforeAll(async () => {
    ({ id, projectFolderPath } = await setupIntegrationTests(file_name, geode_object));
  }, beforeAllTimeout);

  afterAll(async () => {
    await cleanupBackend(projectFolderPath);
  });

  describe("edges", () => {
    describe("edges edge attribute", () => {
      test("coloring edge attribute", async () => {
        const dataStyleStore = useDataStyleStore();
        const viewerStore = useViewerStore();

        const spy = vi.spyOn(viewerStore, "request");
        const edge_attribute = {
          name: default_edge_attribute.name,
          item: default_edge_attribute.item,
          minimum: range[0],
          maximum: range[1],
          colorMap: "batlow",
        };
        await dataStyleStore.setMeshEdgesEdgeAttribute(id, edge_attribute);
        const schema = mesh_edges_schemas.attribute.edge.attribute;
        const points = getRGBPointsFromPreset(edge_attribute.colorMap);
        const params = {
          id,
          name: edge_attribute.name,
          item: edge_attribute.item,
          points,
          minimum: edge_attribute.minimum,
          maximum: edge_attribute.maximum,
          no_data_color: DEFAULT_NO_DATA_COLOR,
        };
        expect(spy).toHaveBeenCalledWith({ schema, params });
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
        await dataStyleStore.setMeshEdgesEdgeAttributeColorMap(id, "budaS");
        expect(dataStyleStore.meshEdgesEdgeAttributeRange(id)).toStrictEqual(range);
        expect(dataStyleStore.meshEdgesEdgeAttributeColorMap(id)).toBe("budaS");
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
        expect(dataStyleStore.meshEdgesEdgeAttributeColorMap(id)).toBe("budaS");
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
