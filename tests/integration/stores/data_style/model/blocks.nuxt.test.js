// oxlint-disable max-lines
// Third party imports
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json" with { type: "json" };

// Local imports
import { beforeAllTimeout, setupIntegrationTests } from "@ogw_tests/integration/setup";
import { Status } from "@ogw_front/utils/status";
import { cleanupBackend } from "@ogw_front/utils/local/cleanup";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const model_blocks_schemas = viewer_schemas.opengeodeweb_viewer.model.blocks;
const file_name = "test.og_brep";
const geode_object = "BRep";
const SLEEP_MS = 200;
const MINIMUM_RANGE = 10;
const MAXIMUM_RANGE = 20;

function sleep(milliseconds) {
  // oxlint-disable-next-line promise/avoid-new
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

let id = "",
  projectFolderPath = "";

describe("model blocks", () => {
  beforeAll(async () => {
    ({ id, projectFolderPath } = await setupIntegrationTests(file_name, geode_object));
  }, beforeAllTimeout);

  afterAll(async () => {
    console.log("afterAll model blocks kill", projectFolderPath);
    await cleanupBackend(projectFolderPath);
  });

  describe("blocks visibility", () => {
    test("visibility false", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const dataStore = useDataStore();
      const block_ids = await dataStore.getBlocksGeodeIds(id);
      const block_viewer_ids = await dataStore.getMeshComponentsViewerIds(id, block_ids);
      const visibility = false;
      const spy = vi.spyOn(viewerStore, "request");
      spy.mockClear();
      const result = dataStyleStore.setModelBlocksVisibility(id, block_ids, visibility);
      expect(result).toBeInstanceOf(Promise);
      await result;
      await sleep(SLEEP_MS);
      const schema = model_blocks_schemas.visibility;
      const params = { id, block_ids: block_viewer_ids, visibility };
      expect(spy).toHaveBeenCalledWith(
        { schema, params },
        {
          response_function: expect.any(Function),
        },
      );
      for (const block_id of block_ids) {
        expect(dataStyleStore.modelBlockVisibility(id, block_id)).toBe(visibility);
      }
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });

  describe("blocks color", () => {
    test("color red", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const dataStore = useDataStore();
      const block_ids = await dataStore.getBlocksGeodeIds(id);
      const block_viewer_ids = await dataStore.getMeshComponentsViewerIds(id, block_ids);
      const color = { red: 255, green: 0, blue: 0, alpha: 1 };
      const spy = vi.spyOn(viewerStore, "request");
      await dataStyleStore.setModelBlocksColor(id, block_ids, color);
      await sleep(SLEEP_MS);
      const schema = model_blocks_schemas.color;
      const params = { id, block_ids: block_viewer_ids, color, color_mode: "constant" };
      expect(spy).toHaveBeenCalledWith(
        { schema, params },
        {
          response_function: expect.any(Function),
        },
      );
      for (const block_id of block_ids) {
        expect(dataStyleStore.modelBlockColor(id, block_id)).toStrictEqual(color);
      }
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });
  describe("blocks vertex attribute", () => {
    test("coloring vertex attribute", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const dataStore = useDataStore();
      const block_ids = await dataStore.getBlocksGeodeIds(id);
      const block_viewer_ids = await dataStore.getMeshComponentsViewerIds(id, block_ids);
      const spy = vi.spyOn(viewerStore, "request");
      spy.mockClear();
      const result = dataStyleStore.setModelBlocksVertexAttributeName(id, block_ids, "points");
      expect(result).toBeInstanceOf(Promise);
      await result;
      await sleep(SLEEP_MS);
      expect(spy).toHaveBeenCalledWith(
        {
          schema: model_blocks_schemas.attribute.vertex.name,
          params: {
            id,
            block_ids: block_viewer_ids,
            name: "points",
            item: 0,
          },
        },
        {
          response_function: expect.any(Function),
        },
      );
      for (const block_id of block_ids) {
        expect(dataStyleStore.modelBlocksVertexAttributeName(id, block_id)).toBe("points");
      }
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("stored configs 1 - select attribute points and item 2", async () => {
      const dataStyleStore = useDataStyleStore();
      const dataStore = useDataStore();
      const block_ids = await dataStore.getBlocksGeodeIds(id);
      const [block_id] = block_ids;
      await dataStyleStore.setModelBlocksVertexAttributeName(id, block_ids, "points");
      await dataStyleStore.setModelBlocksVertexAttributeItem(id, block_ids, 2);
      expect(dataStyleStore.modelBlocksVertexAttributeName(id, block_id)).toBe("points");
      expect(dataStyleStore.modelBlocksVertexAttributeItem(id, block_id)).toBe(2);
    });

    test("stored configs 2 - set range and colormap", async () => {
      const dataStyleStore = useDataStyleStore();
      const dataStore = useDataStore();
      const block_ids = await dataStore.getBlocksGeodeIds(id);
      const [block_id] = block_ids;
      await dataStyleStore.setModelBlocksVertexAttributeRange(
        id,
        block_ids,
        MINIMUM_RANGE,
        MAXIMUM_RANGE,
      );
      await dataStyleStore.setModelBlocksVertexAttributeColorMap(id, block_ids, "discrete:budaS");
      await sleep(SLEEP_MS);
      expect(dataStyleStore.modelBlocksVertexAttributeRange(id, block_id)).toStrictEqual([
        MINIMUM_RANGE,
        MAXIMUM_RANGE,
      ]);
      expect(dataStyleStore.modelBlocksVertexAttributeColorMap(id, block_id)).toBe(
        "discrete:budaS",
      );
    });

    test("stored configs 3 - select unique_vertices", async () => {
      const dataStyleStore = useDataStyleStore();
      const dataStore = useDataStore();
      const block_ids = await dataStore.getBlocksGeodeIds(id);
      const [block_id] = block_ids;
      await dataStyleStore.setModelBlocksVertexAttributeName(id, block_ids, "unique_vertices");
      await dataStyleStore.setModelBlocksVertexAttributeItem(id, block_ids, 0);
      expect(dataStyleStore.modelBlocksVertexAttributeName(id, block_id)).toBe("unique_vertices");
      expect(dataStyleStore.modelBlocksVertexAttributeItem(id, block_id)).toBe(0);
    });

    test("stored configs 4 - switch back to points and verify restoration", async () => {
      const dataStyleStore = useDataStyleStore();
      const dataStore = useDataStore();
      const block_ids = await dataStore.getBlocksGeodeIds(id);
      const [block_id] = block_ids;
      await dataStyleStore.setModelBlocksVertexAttributeName(id, block_ids, "points");
      expect(dataStyleStore.modelBlocksVertexAttributeName(id, block_id)).toBe("points");
      expect(dataStyleStore.modelBlocksVertexAttributeItem(id, block_id)).toBe(2);
      expect(dataStyleStore.modelBlocksVertexAttributeRange(id, block_id)).toStrictEqual([
        MINIMUM_RANGE,
        MAXIMUM_RANGE,
      ]);
      expect(dataStyleStore.modelBlocksVertexAttributeColorMap(id, block_id)).toBe(
        "discrete:budaS",
      );
    });
  });

  describe("blocks polyhedron attribute", () => {
    test("coloring polyhedron attribute", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const dataStore = useDataStore();
      const block_ids = await dataStore.getBlocksGeodeIds(id);
      const block_viewer_ids = await dataStore.getMeshComponentsViewerIds(id, block_ids);
      const spy = vi.spyOn(viewerStore, "request");
      spy.mockClear();
      const result = dataStyleStore.setModelBlocksPolyhedronAttributeName(
        id,
        block_ids,
        "test_attribute",
      );
      expect(result).toBeInstanceOf(Promise);
      await result;
      await sleep(SLEEP_MS);
      expect(spy).toHaveBeenCalledWith(
        {
          schema: model_blocks_schemas.attribute.polyhedron.name,
          params: {
            id,
            block_ids: block_viewer_ids,
            name: "test_attribute",
            item: 0,
          },
        },
        {
          response_function: expect.any(Function),
        },
      );
      for (const block_id of block_ids) {
        expect(dataStyleStore.modelBlocksPolyhedronAttributeName(id, block_id)).toBe(
          "test_attribute",
        );
      }
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("stored configs 1 - select attribute tetrahedron_vertices and item 2", async () => {
      const dataStyleStore = useDataStyleStore();
      const dataStore = useDataStore();
      const block_ids = await dataStore.getBlocksGeodeIds(id);
      const [block_id] = block_ids;
      await dataStyleStore.setModelBlocksPolyhedronAttributeName(
        id,
        block_ids,
        "tetrahedron_vertices",
      );
      await dataStyleStore.setModelBlocksPolyhedronAttributeItem(id, block_ids, 2);
      expect(dataStyleStore.modelBlocksPolyhedronAttributeName(id, block_id)).toBe(
        "tetrahedron_vertices",
      );
      expect(dataStyleStore.modelBlocksPolyhedronAttributeItem(id, block_id)).toBe(2);
    });

    test("stored configs 2 - set range and colormap", async () => {
      const dataStyleStore = useDataStyleStore();
      const dataStore = useDataStore();
      const block_ids = await dataStore.getBlocksGeodeIds(id);
      const [block_id] = block_ids;
      await dataStyleStore.setModelBlocksPolyhedronAttributeRange(
        id,
        block_ids,
        MINIMUM_RANGE,
        MAXIMUM_RANGE,
      );
      await dataStyleStore.setModelBlocksPolyhedronAttributeColorMap(
        id,
        block_ids,
        "discrete:budaS",
      );
      await sleep(SLEEP_MS);
      expect(dataStyleStore.modelBlocksPolyhedronAttributeRange(id, block_id)).toStrictEqual([
        MINIMUM_RANGE,
        MAXIMUM_RANGE,
      ]);
      expect(dataStyleStore.modelBlocksPolyhedronAttributeColorMap(id, block_id)).toBe(
        "discrete:budaS",
      );
    });

    test("stored configs 3 - select tetrahedron_adjacents", async () => {
      const dataStyleStore = useDataStyleStore();
      const dataStore = useDataStore();
      const block_ids = await dataStore.getBlocksGeodeIds(id);
      const [block_id] = block_ids;
      await dataStyleStore.setModelBlocksPolyhedronAttributeName(
        id,
        block_ids,
        "tetrahedron_adjacents",
      );
      await dataStyleStore.setModelBlocksPolyhedronAttributeItem(id, block_ids, 0);
      expect(dataStyleStore.modelBlocksPolyhedronAttributeName(id, block_id)).toBe(
        "tetrahedron_adjacents",
      );
      expect(dataStyleStore.modelBlocksPolyhedronAttributeItem(id, block_id)).toBe(0);
    });

    test("stored configs 4 - switch back to tetrahedron_vertices and verify restoration", async () => {
      const dataStyleStore = useDataStyleStore();
      const dataStore = useDataStore();
      const block_ids = await dataStore.getBlocksGeodeIds(id);
      const [block_id] = block_ids;
      await dataStyleStore.setModelBlocksPolyhedronAttributeName(
        id,
        block_ids,
        "tetrahedron_vertices",
      );
      expect(dataStyleStore.modelBlocksPolyhedronAttributeName(id, block_id)).toBe(
        "tetrahedron_vertices",
      );
      expect(dataStyleStore.modelBlocksPolyhedronAttributeItem(id, block_id)).toBe(2);
      expect(dataStyleStore.modelBlocksPolyhedronAttributeRange(id, block_id)).toStrictEqual([
        MINIMUM_RANGE,
        MAXIMUM_RANGE,
      ]);
      expect(dataStyleStore.modelBlocksPolyhedronAttributeColorMap(id, block_id)).toBe(
        "discrete:budaS",
      );
    });
  });

  describe("blocks style", () => {
    test("blocks apply style", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const result = dataStyleStore.applyModelBlocksStyle(id);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });

  describe("block component active coloring", () => {
    test("coloring color", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const dataStore = useDataStore();
      const block_ids = await dataStore.getBlocksGeodeIds(id);
      const [block_id] = block_ids;
      const coloringName = "constant";
      const result = dataStyleStore.setModelComponentActiveColoring(id, block_id, coloringName);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(dataStyleStore.modelBlockActiveColoring(id, block_id)).toBe(coloringName);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("coloring vertex", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const dataStore = useDataStore();
      const block_ids = await dataStore.getBlocksGeodeIds(id);
      const [block_id] = block_ids;
      await dataStyleStore.setModelBlocksVertexAttributeName(id, [block_id], "points");
      const coloringName = "vertex";
      const result = dataStyleStore.setModelComponentActiveColoring(id, block_id, coloringName);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(dataStyleStore.modelBlockActiveColoring(id, block_id)).toBe(coloringName);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("coloring polyhedron", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const dataStore = useDataStore();
      const block_ids = await dataStore.getBlocksGeodeIds(id);
      const [block_id] = block_ids;
      await dataStyleStore.setModelBlocksPolyhedronAttributeName(id, [block_id], "test_attribute");
      const coloringName = "polyhedron";
      const result = dataStyleStore.setModelComponentActiveColoring(id, block_id, coloringName);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(dataStyleStore.modelBlockActiveColoring(id, block_id)).toBe(coloringName);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });
});
