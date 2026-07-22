// Third party imports
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json" with { type: "json" };

// Local imports
import { beforeAllTimeout, setupIntegrationTests } from "@ogw_tests/integration/setup";
import { Status } from "@ogw_front/utils/status";
import { cleanupBackend } from "@ogw_front/utils/local/cleanup";
import { isMeshCellsVertexAttributeValid } from "@ogw_internal/stores/data_style/mesh/cells/vertex";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const mesh_cells_schemas = viewer_schemas.opengeodeweb_viewer.mesh.cells;
const file_name = "test.og_rgd2d";
const geode_object = "RegularGrid2D";
const MINIMUM_RANGE = 10;
const MAXIMUM_RANGE = 20;
const ALTERNATE_RANGE_MAX = 100;
const range = [MINIMUM_RANGE, MAXIMUM_RANGE];
const default_vertex_attribute = { name: "points", item: 0, range };
const default_cell_attribute = { name: "RGB_data", item: 0, range };

let id = "",
  projectFolderPath = "";

describe("mesh cells", () => {
  beforeAll(async () => {
    id = "";
    projectFolderPath = "";
    ({ id, projectFolderPath } = await setupIntegrationTests(file_name, geode_object));
  }, beforeAllTimeout);

  afterAll(async () => {
    console.log("afterAll mesh cells kill", projectFolderPath);
    await cleanupBackend(projectFolderPath);
  });

  describe("cells visibility", () => {
    test("visibility true", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const visibility = true;
      const spy = vi.spyOn(viewerStore, "request");
      const result = dataStyleStore.setMeshCellsVisibility(id, visibility);
      expect(result).toBeInstanceOf(Promise);
      await result;
      const schema = mesh_cells_schemas.visibility;
      const params = { id, visibility };
      expect(spy).toHaveBeenCalledWith(
        { schema, params },
        {
          response_function: expect.any(Function),
        },
      );
      expect(dataStyleStore.meshCellsVisibility(id)).toBe(visibility);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });

  describe("cells color", () => {
    test("color red", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const color = { red: 255, green: 0, blue: 0, alpha: 1 };
      const spy = vi.spyOn(viewerStore, "request");
      const result = dataStyleStore.setMeshCellsColor(id, color);
      expect(result).toBeInstanceOf(Promise);
      await result;
      const schema = mesh_cells_schemas.color;
      const params = { id, color };
      expect(spy).toHaveBeenCalledWith(
        { schema, params },
        {
          response_function: expect.any(Function),
        },
      );
      expect(dataStyleStore.meshCellsColor(id)).toStrictEqual(color);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });

  describe("cells vertex attribute", () => {
    test("coloring vertex attribute - guard on missing parameters", () => {
      expect(
        isMeshCellsVertexAttributeValid({
          name: "points",
          item: 0,
          minimum: undefined,
          maximum: undefined,
          colorMap: undefined,
        }),
      ).toBe(false);
    });

    test("coloring vertex attribute - set range and colormap", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const spy = vi.spyOn(viewerStore, "request");
      const vertex_attribute = { name: "points", item: 2 };
      const colorMap = "budaS";
      const result = dataStyleStore.setMeshCellsVertexAttribute(id, {
        name: vertex_attribute.name,
        item: vertex_attribute.item,
        minimum: range[0],
        maximum: range[1],
        colorMap,
      });
      expect(result).toBeInstanceOf(Promise);
      await result;
      const schema = mesh_cells_schemas.attribute.vertex.attribute;
      const name = dataStyleStore.meshCellsVertexAttributeName(id);
      const item = dataStyleStore.meshCellsVertexAttributeItem(id);
      expect(spy).toHaveBeenCalledWith({
        schema,
        params: expect.objectContaining({ id, name, item, minimum: range[0], maximum: range[1] }),
      });
      expect(dataStyleStore.meshCellsVertexAttributeRange(id)).toStrictEqual(range);
      expect(dataStyleStore.meshCellsVertexAttributeColorMap(id)).toBe(colorMap);
    });

    test("coloring vertex attribute - item switching", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const spy = vi.spyOn(viewerStore, "request");
      const schema = mesh_cells_schemas.attribute.vertex.attribute;

      await dataStyleStore.setMeshCellsVertexAttribute(id, {
        name: "points",
        item: 0,
        minimum: 0,
        maximum: MAXIMUM_RANGE,
        colorMap: "batlow",
      });
      dataStyleStore.setMeshCellsVertexAttributeColorMap(id, "oleron");
      dataStyleStore.setMeshCellsVertexAttributeRange(id, MINIMUM_RANGE, ALTERNATE_RANGE_MAX);
      await dataStyleStore.setMeshCellsVertexAttribute(id, {
        name: "points",
        item: 0,
        minimum: MINIMUM_RANGE,
        maximum: ALTERNATE_RANGE_MAX,
        colorMap: "oleron",
      });

      dataStyleStore.setMeshCellsVertexAttributeItem(id, 1);
      await dataStyleStore.setMeshCellsVertexAttribute(id, {
        name: "points",
        item: 1,
        minimum: 0,
        maximum: MAXIMUM_RANGE,
        colorMap: "berlin",
      });
      expect(dataStyleStore.meshCellsVertexAttributeItem(id)).toBe(1);
      expect(dataStyleStore.meshCellsVertexAttributeRange(id)).toStrictEqual([0, MAXIMUM_RANGE]);
      expect(spy).toHaveBeenCalledWith({
        schema,
        params: expect.objectContaining({
          id,
          name: "points",
          item: 1,
          minimum: 0,
          maximum: MAXIMUM_RANGE,
        }),
      });
    });

    test("stored configs - restore previous item config", async () => {
      const dataStyleStore = useDataStyleStore();
      dataStyleStore.setMeshCellsVertexAttributeItem(id, 0);
      const storedConfig0 = dataStyleStore.meshCellsVertexAttributeStoredConfig(id, "points", 0);
      await dataStyleStore.setMeshCellsVertexAttribute(id, {
        name: "points",
        item: 0,
        minimum: storedConfig0.minimum,
        maximum: storedConfig0.maximum,
        colorMap: storedConfig0.colorMap,
      });
      expect(dataStyleStore.meshCellsVertexAttributeItem(id)).toBe(0);
      expect(dataStyleStore.meshCellsVertexAttributeRange(id)).toStrictEqual([
        MINIMUM_RANGE,
        ALTERNATE_RANGE_MAX,
      ]);
      expect(dataStyleStore.meshCellsVertexAttributeColorMap(id)).toBe("oleron");
    });

    test("stored configs - select polygon_arround_vertex", async () => {
      const dataStyleStore = useDataStyleStore();
      const result = dataStyleStore.setMeshCellsVertexAttribute(id, {
        name: "polygon_arround_vertex",
        item: 0,
        minimum: 0,
        maximum: MINIMUM_RANGE,
        colorMap: "batlow",
      });
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(dataStyleStore.meshCellsVertexAttributeName(id)).toBe("polygon_arround_vertex");
      expect(dataStyleStore.meshCellsVertexAttributeItem(id)).toBe(0);
      expect(dataStyleStore.meshCellsVertexAttributeRange(id)).toStrictEqual([0, MINIMUM_RANGE]);
      expect(dataStyleStore.meshCellsVertexAttributeColorMap(id)).toBe("batlow");
    });

    test("stored configs - switch back to points and verify state restoration", async () => {
      const dataStyleStore = useDataStyleStore();
      const vertex_attribute = { name: "points", item: 2 };
      const result = dataStyleStore.setMeshCellsVertexAttribute(id, {
        name: vertex_attribute.name,
        item: vertex_attribute.item,
        minimum: range[0],
        maximum: range[1],
        colorMap: "budaS",
      });
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(dataStyleStore.meshCellsVertexAttributeName(id)).toBe(vertex_attribute.name);
      expect(dataStyleStore.meshCellsVertexAttributeItem(id)).toBe(vertex_attribute.item);
      expect(dataStyleStore.meshCellsVertexAttributeRange(id)).toStrictEqual(range);
      expect(dataStyleStore.meshCellsVertexAttributeColorMap(id)).toBe("budaS");
    });
  });

  describe("cells cell attribute", () => {
    test("coloring cell attribute", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const spy = vi.spyOn(viewerStore, "request");
      const cell_attribute = {
        name: default_cell_attribute.name,
        item: default_cell_attribute.item,
        minimum: range[0],
        maximum: range[1],
        colorMap: "batlow",
      };
      const result = dataStyleStore.setMeshCellsCellAttribute(id, cell_attribute);
      expect(result).toBeInstanceOf(Promise);
      await result;
      const schema = mesh_cells_schemas.attribute.cell.attribute;
      const points = getRGBPointsFromPreset(cell_attribute.colorMap);
      const params = {
        id,
        name: cell_attribute.name,
        item: cell_attribute.item,
        points,
        minimum: cell_attribute.minimum,
        maximum: cell_attribute.maximum,
      };
      expect(spy).toHaveBeenCalledWith({ schema, params });
      expect(dataStyleStore.meshCellsCellAttributeName(id)).toBe(cell_attribute.name);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("stored configs 1 - select attribute RGB_data and item 2", async () => {
      const dataStyleStore = useDataStyleStore();
      const cell_attribute = { name: "RGB_data", item: 2 };
      await dataStyleStore.setMeshCellsCellAttributeName(id, cell_attribute.name);
      await dataStyleStore.setMeshCellsCellAttributeItem(id, cell_attribute.item);
      expect(dataStyleStore.meshCellsCellAttributeName(id)).toBe(cell_attribute.name);
      expect(dataStyleStore.meshCellsCellAttributeItem(id)).toBe(cell_attribute.item);
    });

    test("stored configs 2 - set range and colormap", async () => {
      const dataStyleStore = useDataStyleStore();
      await dataStyleStore.setMeshCellsCellAttributeRange(id, range[0], range[1]);
      await dataStyleStore.setMeshCellsCellAttributeColorMap(id, "discrete:budaS");
      expect(dataStyleStore.meshCellsCellAttributeRange(id)).toStrictEqual(range);
      expect(dataStyleStore.meshCellsCellAttributeColorMap(id)).toBe("discrete:budaS");
    });

    test("stored configs 3 - select dummy_attribute", async () => {
      const dataStyleStore = useDataStyleStore();
      await dataStyleStore.setMeshCellsCellAttributeName(id, "dummy_attribute");
      await dataStyleStore.setMeshCellsCellAttributeItem(id, 0);
      expect(dataStyleStore.meshCellsCellAttributeName(id)).toBe("dummy_attribute");
      expect(dataStyleStore.meshCellsCellAttributeItem(id)).toBe(0);
    });

    test("stored configs 4 - switch back to RGB_data and verify restoration", async () => {
      const dataStyleStore = useDataStyleStore();
      const cell_attribute = { name: "RGB_data", item: 2 };
      await dataStyleStore.setMeshCellsCellAttributeName(id, cell_attribute.name);
      expect(dataStyleStore.meshCellsCellAttributeName(id)).toBe(cell_attribute.name);
      expect(dataStyleStore.meshCellsCellAttributeItem(id)).toBe(cell_attribute.item);
      expect(dataStyleStore.meshCellsCellAttributeRange(id)).toStrictEqual(range);
      expect(dataStyleStore.meshCellsCellAttributeColorMap(id)).toBe("discrete:budaS");
    });
  });

  describe("cells active coloring", () => {
    test("coloring color", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const coloringName = "constant";
      const result = dataStyleStore.setMeshCellsActiveColoring(id, coloringName);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(dataStyleStore.meshCellsActiveColoring(id)).toBe(coloringName);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("coloring vertex", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      await dataStyleStore.setMeshCellsVertexAttribute(id, {
        name: default_vertex_attribute.name,
        item: default_vertex_attribute.item,
        minimum: default_vertex_attribute.range[0],
        maximum: default_vertex_attribute.range[1],
        colorMap: "batlow",
      });
      const coloringName = "vertex";
      const result = dataStyleStore.setMeshCellsActiveColoring(id, coloringName);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(dataStyleStore.meshCellsActiveColoring(id)).toBe(coloringName);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("coloring cell", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      await dataStyleStore.setMeshCellsCellAttributeName(id, default_cell_attribute.name);
      const coloringName = "cell";
      const result = dataStyleStore.setMeshCellsActiveColoring(id, coloringName);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(dataStyleStore.meshCellsActiveColoring(id)).toBe(coloringName);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });

  test("cells apply default style", async () => {
    const dataStyleStore = useDataStyleStore();
    const viewerStore = useViewerStore();
    const result = dataStyleStore.applyMeshCellsStyle(id);
    expect(result).toBeInstanceOf(Promise);
    await result;
    expect(viewerStore.status).toBe(Status.CONNECTED);
  });
});
