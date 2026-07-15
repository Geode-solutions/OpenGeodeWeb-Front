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
const mesh_points_schemas = viewer_schemas.opengeodeweb_viewer.mesh.points;
const file_name = "test.og_edc2d";
const geode_object = "EdgedCurve2D";
const vertex_attribute = { name: "points", item: 0 };
const MINIMUM_RANGE = 10;
const MAXIMUM_RANGE = 20;

let id = "",
  projectFolderPath = "";

describe("mesh points", () => {
  beforeAll(async () => {
    ({ id, projectFolderPath } = await setupIntegrationTests(file_name, geode_object));
  }, beforeAllTimeout);

  afterAll(async () => {
    console.log("afterAll mesh points kill", projectFolderPath);
    await cleanupBackend(projectFolderPath);
  });

  describe("points visibility", () => {
    test("visibility true", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const visibility = true;
      const spy = vi.spyOn(viewerStore, "request");
      const result = dataStyleStore.setMeshPointsVisibility(id, visibility);
      expect(result).toBeInstanceOf(Promise);
      await result;
      const schema = mesh_points_schemas.visibility;
      const params = { id, visibility };
      expect(spy).toHaveBeenCalledWith(
        { schema, params },
        {
          response_function: expect.any(Function),
        },
      );
      expect(dataStyleStore.meshPointsVisibility(id)).toBe(visibility);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });

  describe("points color", () => {
    test("color red", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const color = { red: 255, green: 0, blue: 0, alpha: 1 };
      const spy = vi.spyOn(viewerStore, "request");
      const result = dataStyleStore.setMeshPointsColor(id, color);
      expect(result).toBeInstanceOf(Promise);
      await result;
      const schema = mesh_points_schemas.color;
      const params = { id, color };
      expect(spy).toHaveBeenCalledWith(
        { schema, params },
        {
          response_function: expect.any(Function),
        },
      );
      expect(dataStyleStore.meshPointsColor(id)).toStrictEqual(color);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });

  describe("points active coloring", () => {
    test("coloring color", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const coloringName = "constant";
      const result = dataStyleStore.setMeshPointsActiveColoring(id, coloringName);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(dataStyleStore.meshPointsActiveColoring(id)).toBe(coloringName);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("coloring vertex", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      await dataStyleStore.setMeshPointsVertexAttributeName(id, vertex_attribute.name);
      const coloringName = "vertex";
      const result = dataStyleStore.setMeshPointsActiveColoring(id, coloringName);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(dataStyleStore.meshPointsActiveColoring(id)).toBe(coloringName);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });

  describe("points size", () => {
    test("size 20", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const size = 20;
      const spy = vi.spyOn(viewerStore, "request");
      const result = dataStyleStore.setMeshPointsSize(id, size);
      expect(result).toBeInstanceOf(Promise);
      await result;
      const schema = mesh_points_schemas.size;
      const params = { id, size };
      expect(spy).toHaveBeenCalledWith(
        { schema, params },
        {
          response_function: expect.any(Function),
        },
      );
      expect(dataStyleStore.meshPointsSize(id)).toBe(size);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });

  describe("points vertex attribute", () => {
    test("vertex attribute", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();

      const spy = vi.spyOn(viewerStore, "request");
      await dataStyleStore.setMeshPointsVertexAttributeName(id, vertex_attribute.name);
      const schema = mesh_points_schemas.attribute.vertex.name;
      const params = { id, ...vertex_attribute };
      expect(spy).toHaveBeenCalledWith(
        { schema, params },
        {
          response_function: expect.any(Function),
        },
      );
      expect(dataStyleStore.meshPointsVertexAttributeName(id)).toBe(vertex_attribute.name);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("stored configs 1 - select attribute points and item 2", async () => {
      const dataStyleStore = useDataStyleStore();
      await dataStyleStore.setMeshPointsVertexAttributeName(id, "points");
      await dataStyleStore.setMeshPointsVertexAttributeItem(id, 2);
      expect(dataStyleStore.meshPointsVertexAttributeName(id)).toBe("points");
      expect(dataStyleStore.meshPointsVertexAttributeItem(id)).toBe(2);
    });

    test("stored configs 2 - set range and colormap", async () => {
      const dataStyleStore = useDataStyleStore();
      await dataStyleStore.setMeshPointsVertexAttributeRange(id, MINIMUM_RANGE, MAXIMUM_RANGE);
      await dataStyleStore.setMeshPointsVertexAttributeColorMap(id, "discrete:budaS");
      expect(dataStyleStore.meshPointsVertexAttributeRange(id)).toStrictEqual([
        MINIMUM_RANGE,
        MAXIMUM_RANGE,
      ]);
      expect(dataStyleStore.meshPointsVertexAttributeColorMap(id)).toBe("discrete:budaS");
    });

    test("stored configs 3 - select unique_vertices", async () => {
      const dataStyleStore = useDataStyleStore();
      await dataStyleStore.setMeshPointsVertexAttributeName(id, "unique_vertices");
      await dataStyleStore.setMeshPointsVertexAttributeItem(id, 0);
      expect(dataStyleStore.meshPointsVertexAttributeName(id)).toBe("unique_vertices");
      expect(dataStyleStore.meshPointsVertexAttributeItem(id)).toBe(0);
    });

    test("stored configs 4 - switch back to points and verify restoration", async () => {
      const dataStyleStore = useDataStyleStore();
      await dataStyleStore.setMeshPointsVertexAttributeName(id, "points");
      expect(dataStyleStore.meshPointsVertexAttributeName(id)).toBe("points");
      expect(dataStyleStore.meshPointsVertexAttributeItem(id)).toBe(2);
      expect(dataStyleStore.meshPointsVertexAttributeRange(id)).toStrictEqual([
        MINIMUM_RANGE,
        MAXIMUM_RANGE,
      ]);
      expect(dataStyleStore.meshPointsVertexAttributeColorMap(id)).toBe("discrete:budaS");
    });
  });

  test("points apply default style", async () => {
    const dataStyleStore = useDataStyleStore();
    const viewerStore = useViewerStore();
    const result = dataStyleStore.applyMeshPointsStyle(id);
    expect(result).toBeInstanceOf(Promise);
    await result;
    expect(viewerStore.status).toBe(Status.CONNECTED);
  });
});
