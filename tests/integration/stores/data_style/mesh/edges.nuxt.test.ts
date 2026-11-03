// Third party imports
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

// Local imports
import { beforeAllTimeout, setupIntegrationTests } from "@ogw_tests/integration/setup";
import {
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
          // oxlint-disable-next-line no-unsafe-assignment -- expect.any(Function) is untyped by design, this is a vitest matcher not a real callback.
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
          // oxlint-disable-next-line no-unsafe-assignment -- expect.any(Function) is untyped by design, this is a vitest matcher not a real callback.
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
        const vertex_attribute = {
          name: default_vertex_attribute.name,
          item: default_vertex_attribute.item,
          minimum: range[0],
          maximum: range[1],
          colorMap: "batlow",
        };
        await dataStyleStore.setMeshEdgesVertexAttribute(id, vertex_attribute);
        const schema = mesh_edges_schemas.attribute.vertex.attribute;
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
        await dataStyleStore.setMeshEdgesVertexAttributeColorMap(id, "budaS");
        expect(dataStyleStore.meshEdgesVertexAttributeRange(id)).toStrictEqual(range);
        expect(dataStyleStore.meshEdgesVertexAttributeColorMap(id)).toBe("budaS");
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
        expect(dataStyleStore.meshEdgesVertexAttributeColorMap(id)).toBe("budaS");
      });
    });
  });
});
