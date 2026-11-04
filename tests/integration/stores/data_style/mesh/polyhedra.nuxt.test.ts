// Third party imports
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

// Local imports
import { beforeAllTimeout, setupIntegrationTests } from "@ogw_tests/integration/setup";
import {
  default_polyhedron_attribute,
  default_vertex_attribute,
  file_name,
  geode_object,
  mesh_points_schemas,
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

  describe("polyhedra", () => {
    test("polyhedra visibility", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const visibility = true;
      const spy = vi.spyOn(viewerStore, "request");
      const result = dataStyleStore.setMeshPolyhedraVisibility(id, visibility);
      expect(result).toBeInstanceOf(Promise);
      await result;
      const schema = mesh_polyhedra_schemas.visibility;
      const params = { id, visibility };
      expect(spy).toHaveBeenCalledWith(
        { schema, params },
        {
          // oxlint-disable-next-line no-unsafe-assignment -- expect.any(Function) is untyped by design, this is a vitest matcher not a real callback.
          response_function: expect.any(Function),
        },
      );
      expect(dataStyleStore.meshPolyhedraVisibility(id)).toBe(visibility);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("polyhedra color red", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const color = { red: 255, green: 0, blue: 0, alpha: 1 };
      const spy = vi.spyOn(viewerStore, "request");
      const result = dataStyleStore.setMeshPolyhedraColor(id, color);
      expect(result).toBeInstanceOf(Promise);
      await result;
      const schema = mesh_polyhedra_schemas.color;
      const params = { id, color };
      expect(spy).toHaveBeenCalledWith(
        { schema, params },
        {
          // oxlint-disable-next-line no-unsafe-assignment -- expect.any(Function) is untyped by design, this is a vitest matcher not a real callback.
          response_function: expect.any(Function),
        },
      );
      expect(dataStyleStore.meshPolyhedraColor(id)).toStrictEqual(color);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("coloring color", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const coloringName = "constant";
      const result = dataStyleStore.setMeshPolyhedraActiveColoring(id, coloringName);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(dataStyleStore.meshPolyhedraActiveColoring(id)).toBe(coloringName);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("coloring vertex", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      await dataStyleStore.setMeshPolyhedraVertexAttributeName(id, default_vertex_attribute.name);
      const coloringName = "vertex";
      const result = dataStyleStore.setMeshPolyhedraActiveColoring(id, coloringName);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(dataStyleStore.meshPolyhedraActiveColoring(id)).toBe(coloringName);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("coloring polyhedron", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      await dataStyleStore.setMeshPolyhedraPolyhedronAttributeName(
        id,
        default_polyhedron_attribute.name,
      );
      const coloringName = "polyhedron";
      const result = dataStyleStore.setMeshPolyhedraActiveColoring(id, coloringName);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(dataStyleStore.meshPolyhedraActiveColoring(id)).toBe(coloringName);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });

  test("polyhedra apply default style", async () => {
    const dataStyleStore = useDataStyleStore();
    const viewerStore = useViewerStore();
    const result = dataStyleStore.applyMeshPolyhedraStyle(id);
    expect(result).toBeInstanceOf(Promise);
    await result;
    expect(viewerStore.status).toBe(Status.CONNECTED);
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
