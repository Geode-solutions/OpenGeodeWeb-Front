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
const mesh_polygons_schemas = viewer_schemas.opengeodeweb_viewer.mesh.polygons;
const file_name = "test.og_psf3d";
const geode_object = "PolygonalSurface3D";
const MINIMUM_RANGE = 10;
const MAXIMUM_RANGE = 20;
const range = [MINIMUM_RANGE, MAXIMUM_RANGE];
const default_vertex_attribute = { name: "points", item: 0, range };
const default_polygon_attribute = { name: "test_attribute", item: 0, range };

let id = "",
  projectFolderPath = "";

describe("mesh polygons", () => {
  beforeAll(async () => {
    ({ id, projectFolderPath } = await setupIntegrationTests(file_name, geode_object));
  }, beforeAllTimeout);

  afterAll(async () => {
    console.log("afterAll mesh polygons kill", projectFolderPath);
    await cleanupBackend(projectFolderPath);
  });

  describe("polygons visibility", () => {
    test("visibility true", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const visibility = true;
      const spy = vi.spyOn(viewerStore, "request");
      const result = dataStyleStore.setMeshPolygonsVisibility(id, visibility);
      expect(result).toBeInstanceOf(Promise);
      await result;
      const schema = mesh_polygons_schemas.visibility;
      const params = { id, visibility };
      expect(spy).toHaveBeenCalledWith(
        { schema, params },
        {
          response_function: expect.any(Function),
        },
      );
      expect(dataStyleStore.meshPolygonsVisibility(id)).toBe(visibility);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });

  describe("polygons color", () => {
    test("color red", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const color = { red: 255, green: 0, blue: 0, alpha: 1 };
      const spy = vi.spyOn(viewerStore, "request");
      const result = dataStyleStore.setMeshPolygonsColor(id, color);
      expect(result).toBeInstanceOf(Promise);
      await result;
      const schema = mesh_polygons_schemas.color;
      const params = { id, color };
      expect(spy).toHaveBeenCalledWith(
        { schema, params },
        {
          response_function: expect.any(Function),
        },
      );
      expect(dataStyleStore.meshPolygonsColor(id)).toStrictEqual(color);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });

  describe("polygons vertex attribute", () => {
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
      const result = dataStyleStore.setMeshPolygonsVertexAttribute(id, vertex_attribute);
      expect(result).toBeInstanceOf(Promise);
      await result;
      const schema = mesh_polygons_schemas.attribute.vertex.attribute;
      const points = getRGBPointsFromPreset(vertex_attribute.colorMap);
      const params = {
        id,
        name: vertex_attribute.name,
        item: vertex_attribute.item,
        points,
        minimum: vertex_attribute.minimum,
        maximum: vertex_attribute.maximum,
      };
      expect(spy).toHaveBeenCalledWith({ schema, params });
      expect(dataStyleStore.meshPolygonsVertexAttributeName(id)).toBe(vertex_attribute.name);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("stored configs 1 - select attribute points and item 2", async () => {
      const dataStyleStore = useDataStyleStore();
      const vertex_attribute = { name: "points", item: 2 };
      await dataStyleStore.setMeshPolygonsVertexAttributeName(id, vertex_attribute.name);
      await dataStyleStore.setMeshPolygonsVertexAttributeItem(id, vertex_attribute.item);
      expect(dataStyleStore.meshPolygonsVertexAttributeName(id)).toBe(vertex_attribute.name);
      expect(dataStyleStore.meshPolygonsVertexAttributeItem(id)).toBe(vertex_attribute.item);
    });

    test("stored configs 2 - set range and colormap", async () => {
      const dataStyleStore = useDataStyleStore();
      await dataStyleStore.setMeshPolygonsVertexAttributeRange(id, range[0], range[1]);
      await dataStyleStore.setMeshPolygonsVertexAttributeColorMap(id, "budaS");
      expect(dataStyleStore.meshPolygonsVertexAttributeRange(id)).toStrictEqual(range);
      expect(dataStyleStore.meshPolygonsVertexAttributeColorMap(id)).toBe("budaS");
    });

    test("stored configs 3 - select polygon_arround_vertex", async () => {
      const dataStyleStore = useDataStyleStore();
      await dataStyleStore.setMeshPolygonsVertexAttributeName(id, "polygon_arround_vertex");
      await dataStyleStore.setMeshPolygonsVertexAttributeItem(id, 0);
      expect(dataStyleStore.meshPolygonsVertexAttributeName(id)).toBe("polygon_arround_vertex");
      expect(dataStyleStore.meshPolygonsVertexAttributeItem(id)).toBe(0);
    });

    test("stored configs 4 - switch back to points and verify restoration", async () => {
      const dataStyleStore = useDataStyleStore();
      const vertex_attribute = { name: "points", item: 2 };
      await dataStyleStore.setMeshPolygonsVertexAttributeName(id, vertex_attribute.name);
      expect(dataStyleStore.meshPolygonsVertexAttributeName(id)).toBe(vertex_attribute.name);
      expect(dataStyleStore.meshPolygonsVertexAttributeItem(id)).toBe(vertex_attribute.item);
      expect(dataStyleStore.meshPolygonsVertexAttributeRange(id)).toStrictEqual(range);
      expect(dataStyleStore.meshPolygonsVertexAttributeColorMap(id)).toBe("budaS");
    });
  });

  describe("polygons polygon attribute", () => {
    test("coloring polygon attribute", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const spy = vi.spyOn(viewerStore, "request");
      const polygon_attribute = {
        name: default_polygon_attribute.name,
        item: default_polygon_attribute.item,
        minimum: range[0],
        maximum: range[1],
        colorMap: "batlow",
      };
      const result = dataStyleStore.setMeshPolygonsPolygonAttribute(id, polygon_attribute);
      expect(result).toBeInstanceOf(Promise);
      await result;
      const schema = mesh_polygons_schemas.attribute.polygon.attribute;
      const points = getRGBPointsFromPreset(polygon_attribute.colorMap);
      const params = {
        id,
        name: polygon_attribute.name,
        item: polygon_attribute.item,
        points,
        minimum: polygon_attribute.minimum,
        maximum: polygon_attribute.maximum,
      };
      expect(spy).toHaveBeenCalledWith({ schema, params });
      expect(dataStyleStore.meshPolygonsPolygonAttributeName(id)).toBe(polygon_attribute.name);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("stored configs 1 - select attribute test_attribute and item 2", async () => {
      const dataStyleStore = useDataStyleStore();
      const polygon_attribute = { name: "test_attribute", item: 2 };
      await dataStyleStore.setMeshPolygonsPolygonAttributeName(id, polygon_attribute.name);
      await dataStyleStore.setMeshPolygonsPolygonAttributeItem(id, polygon_attribute.item);
      expect(dataStyleStore.meshPolygonsPolygonAttributeName(id)).toBe(polygon_attribute.name);
      expect(dataStyleStore.meshPolygonsPolygonAttributeItem(id)).toBe(polygon_attribute.item);
    });

    test("stored configs 2 - set range and colormap", async () => {
      const dataStyleStore = useDataStyleStore();
      await dataStyleStore.setMeshPolygonsPolygonAttributeRange(id, range[0], range[1]);
      await dataStyleStore.setMeshPolygonsPolygonAttributeColorMap(id, "budaS");
      expect(dataStyleStore.meshPolygonsPolygonAttributeRange(id)).toStrictEqual(range);
      expect(dataStyleStore.meshPolygonsPolygonAttributeColorMap(id)).toBe("budaS");
    });

    test("stored configs 3 - select dummy_attribute", async () => {
      const dataStyleStore = useDataStyleStore();
      await dataStyleStore.setMeshPolygonsPolygonAttributeName(id, "dummy_attribute");
      await dataStyleStore.setMeshPolygonsPolygonAttributeItem(id, 0);
      expect(dataStyleStore.meshPolygonsPolygonAttributeName(id)).toBe("dummy_attribute");
      expect(dataStyleStore.meshPolygonsPolygonAttributeItem(id)).toBe(0);
    });

    test("stored configs 4 - switch back to test_attribute and verify restoration", async () => {
      const dataStyleStore = useDataStyleStore();
      const polygon_attribute = { name: "test_attribute", item: 2 };
      await dataStyleStore.setMeshPolygonsPolygonAttributeName(id, polygon_attribute.name);
      expect(dataStyleStore.meshPolygonsPolygonAttributeName(id)).toBe(polygon_attribute.name);
      expect(dataStyleStore.meshPolygonsPolygonAttributeItem(id)).toBe(polygon_attribute.item);
      expect(dataStyleStore.meshPolygonsPolygonAttributeRange(id)).toStrictEqual(range);
      expect(dataStyleStore.meshPolygonsPolygonAttributeColorMap(id)).toBe("budaS");
    });
  });

  describe("polygons active coloring", () => {
    test("coloring color", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const coloringName = "constant";
      const result = dataStyleStore.setMeshPolygonsActiveColoring(id, coloringName);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(dataStyleStore.meshPolygonsActiveColoring(id)).toBe(coloringName);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("coloring vertex", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      await dataStyleStore.setMeshPolygonsVertexAttributeName(id, default_vertex_attribute.name);
      const coloringName = "vertex";
      const result = dataStyleStore.setMeshPolygonsActiveColoring(id, coloringName);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(dataStyleStore.meshPolygonsActiveColoring(id)).toBe(coloringName);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("coloring polygon", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      await dataStyleStore.setMeshPolygonsPolygonAttributeName(id, default_polygon_attribute.name);
      const coloringName = "polygon";
      const result = dataStyleStore.setMeshPolygonsActiveColoring(id, coloringName);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(dataStyleStore.meshPolygonsActiveColoring(id)).toBe(coloringName);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });

  test("polygons apply default style", async () => {
    const dataStyleStore = useDataStyleStore();
    const viewerStore = useViewerStore();
    const result = dataStyleStore.applyMeshPolygonsStyle(id);
    expect(result).toBeInstanceOf(Promise);
    await result;
    expect(viewerStore.status).toBe(Status.CONNECTED);
  });
});
