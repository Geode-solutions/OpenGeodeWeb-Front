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
const mesh_cells_schemas = viewer_schemas.opengeodeweb_viewer.mesh.cells;
const file_name = "test.og_rgd2d";
const geode_object = "RegularGrid2D";
const vertex_attribute = { name: "points", item: 0 };
const cell_attribute = { name: "RGB_data", item: 0 };
const MINIMUM_RANGE = 10;
const MAXIMUM_RANGE = 20;

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
    test("coloring vertex attribute", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const spy = vi.spyOn(viewerStore, "request");
      const result = dataStyleStore.setMeshCellsVertexAttributeName(id, vertex_attribute.name);
      expect(result).toBeInstanceOf(Promise);
      await result;
      const schema = mesh_cells_schemas.attribute.vertex.name;
      const params = { id, ...vertex_attribute };
      expect(spy).toHaveBeenCalledWith(
        { schema, params },
        {
          response_function: expect.any(Function),
        },
      );
      expect(dataStyleStore.meshCellsVertexAttributeName(id)).toBe(vertex_attribute.name);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("stored configs 1 - select attribute points and item 2", async () => {
      const dataStyleStore = useDataStyleStore();
      await dataStyleStore.setMeshCellsVertexAttributeName(id, "points");
      await dataStyleStore.setMeshCellsVertexAttributeItem(id, 2);
      expect(dataStyleStore.meshCellsVertexAttributeName(id)).toBe("points");
      expect(dataStyleStore.meshCellsVertexAttributeItem(id)).toBe(2);
    });

    test("stored configs 2 - set range and colormap", async () => {
      const dataStyleStore = useDataStyleStore();
      await dataStyleStore.setMeshCellsVertexAttributeRange(id, MINIMUM_RANGE, MAXIMUM_RANGE);
      await dataStyleStore.setMeshCellsVertexAttributeColorMap(id, "discrete:budaS");
      expect(dataStyleStore.meshCellsVertexAttributeRange(id)).toStrictEqual([
        MINIMUM_RANGE,
        MAXIMUM_RANGE,
      ]);
      expect(dataStyleStore.meshCellsVertexAttributeColorMap(id)).toBe("discrete:budaS");
    });

    test("stored configs 3 - select polygon_arround_vertex", async () => {
      const dataStyleStore = useDataStyleStore();
      await dataStyleStore.setMeshCellsVertexAttributeName(id, "polygon_arround_vertex");
      await dataStyleStore.setMeshCellsVertexAttributeItem(id, 0);
      expect(dataStyleStore.meshCellsVertexAttributeName(id)).toBe("polygon_arround_vertex");
      expect(dataStyleStore.meshCellsVertexAttributeItem(id)).toBe(0);
    });

    test("stored configs 4 - switch back to points and verify restoration", async () => {
      const dataStyleStore = useDataStyleStore();
      await dataStyleStore.setMeshCellsVertexAttributeName(id, "points");
      expect(dataStyleStore.meshCellsVertexAttributeName(id)).toBe("points");
      expect(dataStyleStore.meshCellsVertexAttributeItem(id)).toBe(2);
      expect(dataStyleStore.meshCellsVertexAttributeRange(id)).toStrictEqual([
        MINIMUM_RANGE,
        MAXIMUM_RANGE,
      ]);
      expect(dataStyleStore.meshCellsVertexAttributeColorMap(id)).toBe("discrete:budaS");
    });
  });

  describe("cells cell attribute", () => {
    test("coloring cell attribute", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const spy = vi.spyOn(viewerStore, "request");
      const result = dataStyleStore.setMeshCellsCellAttributeName(id, cell_attribute.name);
      expect(result).toBeInstanceOf(Promise);
      await result;
      const schema = mesh_cells_schemas.attribute.cell.name;
      const params = { id, ...cell_attribute };
      expect(spy).toHaveBeenCalledWith(
        { schema, params },
        {
          response_function: expect.any(Function),
        },
      );
      expect(dataStyleStore.meshCellsCellAttributeName(id)).toBe(cell_attribute.name);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("stored configs 1 - select attribute RGB_data and item 2", async () => {
      const dataStyleStore = useDataStyleStore();
      await dataStyleStore.setMeshCellsCellAttributeName(id, "RGB_data");
      await dataStyleStore.setMeshCellsCellAttributeItem(id, 2);
      expect(dataStyleStore.meshCellsCellAttributeName(id)).toBe("RGB_data");
      expect(dataStyleStore.meshCellsCellAttributeItem(id)).toBe(2);
    });

    test("stored configs 2 - set range and colormap", async () => {
      const dataStyleStore = useDataStyleStore();
      await dataStyleStore.setMeshCellsCellAttributeRange(id, MINIMUM_RANGE, MAXIMUM_RANGE);
      await dataStyleStore.setMeshCellsCellAttributeColorMap(id, "discrete:budaS");
      expect(dataStyleStore.meshCellsCellAttributeRange(id)).toStrictEqual([
        MINIMUM_RANGE,
        MAXIMUM_RANGE,
      ]);
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
      await dataStyleStore.setMeshCellsCellAttributeName(id, "RGB_data");
      expect(dataStyleStore.meshCellsCellAttributeName(id)).toBe("RGB_data");
      expect(dataStyleStore.meshCellsCellAttributeItem(id)).toBe(2);
      expect(dataStyleStore.meshCellsCellAttributeRange(id)).toStrictEqual([
        MINIMUM_RANGE,
        MAXIMUM_RANGE,
      ]);
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
      await dataStyleStore.setMeshCellsVertexAttributeName(id, vertex_attribute.name);
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
      await dataStyleStore.setMeshCellsCellAttributeName(id, cell_attribute.name);
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
