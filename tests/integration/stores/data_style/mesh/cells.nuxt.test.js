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
const INTERVAL_TIMEOUT = 60_000;
const mesh_cells_schemas = viewer_schemas.opengeodeweb_viewer.mesh.cells;
const file_name = "test.og_rgd2d";
const geode_object = "RegularGrid2D";
const vertex_attribute = { name: "points" };
const cell_attribute = { name: "RGB_data" };

let id = "",
  projectFolderPath = "";

describe("mesh cells", () => {
  beforeAll(async () => {
    id = "";
    projectFolderPath = "";
    ({ id, projectFolderPath } = await setupIntegrationTests(file_name, geode_object));
  }, INTERVAL_TIMEOUT);

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
      expect(spy).toHaveBeenCalledWith(
        mesh_cells_schemas.visibility,
        { id, visibility },
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
      expect(spy).toHaveBeenCalledWith(
        mesh_cells_schemas.color,
        { id, color },
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
      expect(spy).toHaveBeenCalledWith(
        mesh_cells_schemas.attribute.vertex.name,
        { id, ...vertex_attribute },
        {
          response_function: expect.any(Function),
        },
      );
      expect(dataStyleStore.meshCellsVertexAttributeName(id)).toBe(vertex_attribute.name);
      expect(viewerStore.status).toBe(Status.CONNECTED);
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
      expect(spy).toHaveBeenCalledWith(
        mesh_cells_schemas.attribute.cell.name,
        { id, ...cell_attribute },
        {
          response_function: expect.any(Function),
        },
      );
      expect(dataStyleStore.meshCellsCellAttributeName(id)).toBe(cell_attribute.name);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });

  describe("cells active coloring", () => {
    test("coloring color", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const coloringName = "color";
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
