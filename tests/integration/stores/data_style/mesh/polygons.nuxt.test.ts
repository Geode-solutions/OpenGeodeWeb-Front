// Third party imports
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

// Local imports
import { beforeAllTimeout, setupIntegrationTests } from "@ogw_tests/integration/setup";
import {
  default_vertex_attribute,
  file_name,
  geode_object,
  mesh_points_schemas,
  mesh_polygons_schemas,
  range,
} from "@ogw_tests/integration/stores/data_style/mesh/polygons_helpers";
import { DEFAULT_NO_DATA_COLOR } from "@ogw_front/utils/default_styles/constants";
import { Status } from "@ogw_front/utils/status";
import { cleanupBackend } from "@ogw_server/utils/cleanup";
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const HALF_OPACITY = 0.5;

let id = "";
let projectFolderPath = "";

describe("mesh polygons", () => {
  beforeAll(async () => {
    ({ id, projectFolderPath } = await setupIntegrationTests(file_name, geode_object));
  }, beforeAllTimeout);

  afterAll(async () => {
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
          // oxlint-disable-next-line no-unsafe-assignment -- expect.any(Function) is untyped by design, this is a vitest matcher not a real callback.
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
          // oxlint-disable-next-line no-unsafe-assignment -- expect.any(Function) is untyped by design, this is a vitest matcher not a real callback.
          response_function: expect.any(Function),
        },
      );
      expect(dataStyleStore.meshPolygonsColor(id)).toStrictEqual(color);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });

  describe("polygons opacity", () => {
    test("opacity half", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const spy = vi.spyOn(viewerStore, "request");
      const result = dataStyleStore.setMeshPolygonsOpacity(id, HALF_OPACITY);
      expect(result).toBeInstanceOf(Promise);
      await result;
      const schema = mesh_polygons_schemas.opacity;
      const params = { id, opacity: HALF_OPACITY };
      expect(spy).toHaveBeenCalledWith(
        { schema, params },
        {
          // oxlint-disable-next-line no-unsafe-assignment -- expect.any(Function) is untyped by design, this is a vitest matcher not a real callback.
          response_function: expect.any(Function),
        },
      );
      expect(dataStyleStore.meshPolygonsOpacity(id)).toBe(HALF_OPACITY);
      expect(dataStyleStore.meshPolygonsColor(id)?.alpha).toBe(HALF_OPACITY);
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
        no_data_color: DEFAULT_NO_DATA_COLOR,
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

  describe("points vertex attribute", () => {
    test("points vertex attribute", async () => {
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
      await dataStyleStore.setMeshPointsVertexAttribute(id, vertex_attribute);
      const params = {
        id,
        name: vertex_attribute.name,
        item: vertex_attribute.item,
        points: getRGBPointsFromPreset(vertex_attribute.colorMap),
        minimum: vertex_attribute.minimum,
        maximum: vertex_attribute.maximum,
        no_data_color: DEFAULT_NO_DATA_COLOR,
      };
      expect(spy).toHaveBeenCalledWith({
        schema: mesh_points_schemas.attribute.vertex.attribute,
        params,
      });
      expect(dataStyleStore.meshPointsVertexAttributeName(id)).toBe(vertex_attribute.name);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });
});
