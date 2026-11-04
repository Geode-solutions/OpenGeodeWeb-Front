// Third party imports
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

// Local imports
import { beforeAllTimeout, setupIntegrationTests } from "@ogw_tests/integration/setup";
import {
  default_polyhedron_attribute,
  default_vertex_attribute,
  file_name,
  geode_object,
  mesh_polyhedra_schemas,
  range,
} from "@ogw_tests/integration/stores/data_style/mesh/polyhedra_helpers";
import { DEFAULT_NO_DATA_COLOR } from "@ogw_front/utils/default_styles/constants";
import { Status } from "@ogw_front/utils/status";
import { cleanupBackend } from "@ogw_server/utils/cleanup";
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useViewerStore } from "@ogw_front/stores/viewer";

let id = "";
let projectFolderPath = "";

describe("mesh polyhedra", () => {
  beforeAll(async () => {
    ({ id, projectFolderPath } = await setupIntegrationTests(file_name, geode_object));
  }, beforeAllTimeout);

  afterAll(async () => {
    await cleanupBackend(projectFolderPath);
  });

  describe("polyhedra vertex attribute", () => {
    test("coloring vertex attribute", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();

      const spy = vi.spyOn(viewerStore, "request");
      const vertex_attribute = {
        name: default_vertex_attribute.name,
        item: default_vertex_attribute.item,
        minimum: range[0],
        maximum: range[1],
        colorMap: "batlow",
      };
      await dataStyleStore.setMeshPolyhedraVertexAttribute(id, vertex_attribute);
      const schema = mesh_polyhedra_schemas.attribute.vertex.attribute;
      const points = getRGBPointsFromPreset(vertex_attribute.colorMap);
      const params = {
        id,
        name: vertex_attribute.name,
        item: vertex_attribute.item,
        points,
        minimum: vertex_attribute.minimum,
        maximum: vertex_attribute.maximum,
        no_data_color: DEFAULT_NO_DATA_COLOR,
      };
      expect(spy).toHaveBeenCalledWith({ schema, params });
      expect(dataStyleStore.meshPolyhedraVertexAttributeName(id)).toBe(vertex_attribute.name);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("stored configs 1 - select attribute points and item 2", async () => {
      const dataStyleStore = useDataStyleStore();
      const vertex_attribute = { name: "points", item: 2 };
      await dataStyleStore.setMeshPolyhedraVertexAttributeName(id, vertex_attribute.name);
      await dataStyleStore.setMeshPolyhedraVertexAttributeItem(id, vertex_attribute.item);
      expect(dataStyleStore.meshPolyhedraVertexAttributeName(id)).toBe(vertex_attribute.name);
      expect(dataStyleStore.meshPolyhedraVertexAttributeItem(id)).toBe(vertex_attribute.item);
    });

    test("stored configs 2 - set range and colormap", async () => {
      const dataStyleStore = useDataStyleStore();
      await dataStyleStore.setMeshPolyhedraVertexAttributeRange(id, range[0], range[1]);
      await dataStyleStore.setMeshPolyhedraVertexAttributeColorMap(id, "budaS");
      expect(dataStyleStore.meshPolyhedraVertexAttributeRange(id)).toStrictEqual(range);
      expect(dataStyleStore.meshPolyhedraVertexAttributeColorMap(id)).toBe("budaS");
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
      const vertex_attribute = { name: "points", item: 2 };
      await dataStyleStore.setMeshPolyhedraVertexAttributeName(id, vertex_attribute.name);
      expect(dataStyleStore.meshPolyhedraVertexAttributeName(id)).toBe(vertex_attribute.name);
      expect(dataStyleStore.meshPolyhedraVertexAttributeItem(id)).toBe(vertex_attribute.item);
      expect(dataStyleStore.meshPolyhedraVertexAttributeRange(id)).toStrictEqual(range);
      expect(dataStyleStore.meshPolyhedraVertexAttributeColorMap(id)).toBe("budaS");
    });
  });

  describe("polyhedra polyhedron attribute", () => {
    test("polyhedra polyhedron attribute", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();

      const spy = vi.spyOn(viewerStore, "request");
      const polyhedron_attribute = {
        name: default_polyhedron_attribute.name,
        item: default_polyhedron_attribute.item,
        minimum: range[0],
        maximum: range[1],
        colorMap: "batlow",
      };
      await dataStyleStore.setMeshPolyhedraPolyhedronAttribute(id, polyhedron_attribute);
      const schema = mesh_polyhedra_schemas.attribute.polyhedron.attribute;
      const points = getRGBPointsFromPreset(polyhedron_attribute.colorMap);
      const params = {
        id,
        name: polyhedron_attribute.name,
        item: polyhedron_attribute.item,
        points,
        minimum: polyhedron_attribute.minimum,
        maximum: polyhedron_attribute.maximum,
        no_data_color: DEFAULT_NO_DATA_COLOR,
      };
      expect(spy).toHaveBeenCalledWith({ schema, params });
      expect(dataStyleStore.meshPolyhedraPolyhedronAttributeName(id)).toBe(
        polyhedron_attribute.name,
      );
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("stored configs 1 - select attribute tetrahedron_vertices and item 2", async () => {
      const dataStyleStore = useDataStyleStore();
      const polyhedron_attribute = { name: "tetrahedron_vertices", item: 2 };
      await dataStyleStore.setMeshPolyhedraPolyhedronAttributeName(id, polyhedron_attribute.name);
      await dataStyleStore.setMeshPolyhedraPolyhedronAttributeItem(id, polyhedron_attribute.item);
      expect(dataStyleStore.meshPolyhedraPolyhedronAttributeName(id)).toBe(
        polyhedron_attribute.name,
      );
      expect(dataStyleStore.meshPolyhedraPolyhedronAttributeItem(id)).toBe(
        polyhedron_attribute.item,
      );
    });

    test("stored configs 2 - set range and colormap", async () => {
      const dataStyleStore = useDataStyleStore();
      await dataStyleStore.setMeshPolyhedraPolyhedronAttributeRange(id, range[0], range[1]);
      await dataStyleStore.setMeshPolyhedraPolyhedronAttributeColorMap(id, "budaS");
      expect(dataStyleStore.meshPolyhedraPolyhedronAttributeRange(id)).toStrictEqual(range);
      expect(dataStyleStore.meshPolyhedraPolyhedronAttributeColorMap(id)).toBe("budaS");
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
      const polyhedron_attribute = { name: "tetrahedron_vertices", item: 2 };
      await dataStyleStore.setMeshPolyhedraPolyhedronAttributeName(id, polyhedron_attribute.name);
      expect(dataStyleStore.meshPolyhedraPolyhedronAttributeName(id)).toBe(
        polyhedron_attribute.name,
      );
      expect(dataStyleStore.meshPolyhedraPolyhedronAttributeItem(id)).toBe(
        polyhedron_attribute.item,
      );
      expect(dataStyleStore.meshPolyhedraPolyhedronAttributeRange(id)).toStrictEqual(range);
      expect(dataStyleStore.meshPolyhedraPolyhedronAttributeColorMap(id)).toBe("budaS");
    });
  });
});
