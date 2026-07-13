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
const model_lines_schemas = viewer_schemas.opengeodeweb_viewer.model.lines;
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

describe("model lines", () => {
  beforeAll(async () => {
    ({ id, projectFolderPath } = await setupIntegrationTests(file_name, geode_object));
  }, beforeAllTimeout);

  afterAll(async () => {
    console.log("afterAll model lines kill", projectFolderPath);
    await cleanupBackend(projectFolderPath);
  });

  describe("lines visibility", () => {
    test("visibility false", async () => {
      console.log("FROM TEST MODEL LINES");
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const dataStore = useDataStore();
      const line_ids = await dataStore.getLinesGeodeIds(id);
      const lines_viewer_ids = await dataStore.getMeshComponentsViewerIds(id, line_ids);
      const visibility = false;
      const spy = vi.spyOn(viewerStore, "request");
      spy.mockClear();
      const result = dataStyleStore.setModelLinesVisibility(id, line_ids, visibility);
      expect(result).toBeInstanceOf(Promise);
      await result;
      await sleep(SLEEP_MS);
      const schema = model_lines_schemas.visibility;
      const params = { id, block_ids: lines_viewer_ids, visibility };
      expect(spy).toHaveBeenCalledWith(
        { schema, params },
        {
          response_function: expect.any(Function),
        },
      );
      for (const line_id of line_ids) {
        expect(dataStyleStore.modelLineVisibility(id, line_id)).toBe(visibility);
      }
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });

  describe("lines color", () => {
    test("color red", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const dataStore = useDataStore();
      const line_ids = await dataStore.getLinesGeodeIds(id);
      const lines_viewer_ids = await dataStore.getMeshComponentsViewerIds(id, line_ids);
      const color = { red: 255, green: 0, blue: 0, alpha: 1 };
      const spy = vi.spyOn(viewerStore, "request");
      spy.mockClear();
      const result = dataStyleStore.setModelLinesColor(id, line_ids, color);
      expect(result).toBeInstanceOf(Promise);
      await result;
      await sleep(SLEEP_MS);
      const schema = model_lines_schemas.color;
      const params = { id, block_ids: lines_viewer_ids, color, color_mode: "constant" };
      expect(spy).toHaveBeenCalledWith(
        { schema, params },
        {
          response_function: expect.any(Function),
        },
      );
      for (const line_id of line_ids) {
        expect(dataStyleStore.modelLineColor(id, line_id)).toStrictEqual(color);
      }
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });
  describe("lines vertex attribute", () => {
    test("coloring vertex attribute", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const dataStore = useDataStore();
      const line_ids = await dataStore.getLinesGeodeIds(id);
      const lines_viewer_ids = await dataStore.getMeshComponentsViewerIds(id, line_ids);
      const spy = vi.spyOn(viewerStore, "request");
      spy.mockClear();
      const result = dataStyleStore.setModelLinesVertexAttributeName(id, line_ids, "points");
      expect(result).toBeInstanceOf(Promise);
      await result;
      await sleep(SLEEP_MS);
      expect(spy).toHaveBeenCalledWith(
        {
          schema: model_lines_schemas.attribute.vertex.name,
          params: {
            id,
            block_ids: lines_viewer_ids,
            name: "points",
            item: 0,
          },
        },
        {
          response_function: expect.any(Function),
        },
      );
      for (const line_id of line_ids) {
        expect(dataStyleStore.modelLinesVertexAttributeName(id, line_id)).toBe("points");
      }
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("stored configs 1 - select attribute points and item 2", async () => {
      const dataStyleStore = useDataStyleStore();
      const dataStore = useDataStore();
      const line_ids = await dataStore.getLinesGeodeIds(id);
      const [line_id] = line_ids;
      await dataStyleStore.setModelLinesVertexAttributeName(id, line_ids, "points");
      await dataStyleStore.setModelLinesVertexAttributeName(id, line_ids, "points", 2);
      expect(dataStyleStore.modelLinesVertexAttributeName(id, line_id)).toBe("points");
      expect(dataStyleStore.modelLinesVertexAttributeValue(id, line_id).item).toBe(2);
    });

    test("stored configs 2 - set range and colormap", async () => {
      const dataStyleStore = useDataStyleStore();
      const dataStore = useDataStore();
      const line_ids = await dataStore.getLinesGeodeIds(id);
      const [line_id] = line_ids;
      await dataStyleStore.setModelLinesVertexAttributeRange(
        id,
        line_ids,
        MINIMUM_RANGE,
        MAXIMUM_RANGE,
      );
      await dataStyleStore.setModelLinesVertexAttributeColorMap(id, line_ids, "discrete:budaS");
      await sleep(SLEEP_MS);
      expect(dataStyleStore.modelLinesVertexAttributeRange(id, line_id)).toStrictEqual([
        MINIMUM_RANGE,
        MAXIMUM_RANGE,
      ]);
      expect(dataStyleStore.modelLinesVertexAttributeColorMap(id, line_id)).toBe("discrete:budaS");
    });

    test("stored configs 3 - select unique_vertices", async () => {
      const dataStyleStore = useDataStyleStore();
      const dataStore = useDataStore();
      const line_ids = await dataStore.getLinesGeodeIds(id);
      const [line_id] = line_ids;
      await dataStyleStore.setModelLinesVertexAttributeName(id, line_ids, "unique_vertices");
      expect(dataStyleStore.modelLinesVertexAttributeName(id, line_id)).toBe("unique_vertices");
      expect(dataStyleStore.modelLinesVertexAttributeValue(id, line_id).item).toBe(0);
    });

    test("stored configs 4 - switch back to points and verify restoration", async () => {
      const dataStyleStore = useDataStyleStore();
      const dataStore = useDataStore();
      const line_ids = await dataStore.getLinesGeodeIds(id);
      const [line_id] = line_ids;
      await dataStyleStore.setModelLinesVertexAttributeName(id, line_ids, "points", 0);
      expect(dataStyleStore.modelLinesVertexAttributeName(id, line_id)).toBe("points");
      expect(dataStyleStore.modelLinesVertexAttributeValue(id, line_id).item).toBe(2);
      expect(dataStyleStore.modelLinesVertexAttributeRange(id, line_id)).toStrictEqual([
        MINIMUM_RANGE,
        MAXIMUM_RANGE,
      ]);
      expect(dataStyleStore.modelLinesVertexAttributeColorMap(id, line_id)).toBe("discrete:budaS");
    });
  });

  describe("lines edge attribute", () => {
    test("coloring edge attribute", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const dataStore = useDataStore();
      const line_ids = await dataStore.getLinesGeodeIds(id);
      const lines_viewer_ids = await dataStore.getMeshComponentsViewerIds(id, line_ids);
      const spy = vi.spyOn(viewerStore, "request");
      spy.mockClear();
      const result = dataStyleStore.setModelLinesEdgeAttributeName(id, line_ids, "test_attribute");
      expect(result).toBeInstanceOf(Promise);
      await result;
      await sleep(SLEEP_MS);
      expect(spy).toHaveBeenCalledWith(
        {
          schema: model_lines_schemas.attribute.edge.name,
          params: {
            id,
            block_ids: lines_viewer_ids,
            name: "test_attribute",
            item: 0,
          },
        },
        {
          response_function: expect.any(Function),
        },
      );
      for (const line_id of line_ids) {
        expect(dataStyleStore.modelLinesEdgeAttributeName(id, line_id)).toBe("test_attribute");
      }
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("stored configs 1 - select attribute edges and item 2", async () => {
      const dataStyleStore = useDataStyleStore();
      const dataStore = useDataStore();
      const line_ids = await dataStore.getLinesGeodeIds(id);
      const [line_id] = line_ids;
      await dataStyleStore.setModelLinesEdgeAttributeName(id, line_ids, "edges");
      await dataStyleStore.setModelLinesEdgeAttributeName(id, line_ids, "edges", 2);
      expect(dataStyleStore.modelLinesEdgeAttributeName(id, line_id)).toBe("edges");
      expect(dataStyleStore.modelLinesEdgeAttributeValue(id, line_id).item).toBe(2);
    });

    test("stored configs 2 - set range and colormap", async () => {
      const dataStyleStore = useDataStyleStore();
      const dataStore = useDataStore();
      const line_ids = await dataStore.getLinesGeodeIds(id);
      const [line_id] = line_ids;
      await dataStyleStore.setModelLinesEdgeAttributeRange(
        id,
        line_ids,
        MINIMUM_RANGE,
        MAXIMUM_RANGE,
      );
      await dataStyleStore.setModelLinesEdgeAttributeColorMap(id, line_ids, "discrete:budaS");
      await sleep(SLEEP_MS);
      expect(dataStyleStore.modelLinesEdgeAttributeRange(id, line_id)).toStrictEqual([
        MINIMUM_RANGE,
        MAXIMUM_RANGE,
      ]);
      expect(dataStyleStore.modelLinesEdgeAttributeColorMap(id, line_id)).toBe("discrete:budaS");
    });

    test("stored configs 3 - select dummy_attribute", async () => {
      const dataStyleStore = useDataStyleStore();
      const dataStore = useDataStore();
      const line_ids = await dataStore.getLinesGeodeIds(id);
      const [line_id] = line_ids;
      await dataStyleStore.setModelLinesEdgeAttributeName(id, line_ids, "dummy_attribute");
      expect(dataStyleStore.modelLinesEdgeAttributeName(id, line_id)).toBe("dummy_attribute");
      expect(dataStyleStore.modelLinesEdgeAttributeValue(id, line_id).item).toBe(0);
    });

    test("stored configs 4 - switch back to edges and verify restoration", async () => {
      const dataStyleStore = useDataStyleStore();
      const dataStore = useDataStore();
      const line_ids = await dataStore.getLinesGeodeIds(id);
      const [line_id] = line_ids;
      await dataStyleStore.setModelLinesEdgeAttributeName(id, line_ids, "edges", 0);
      expect(dataStyleStore.modelLinesEdgeAttributeName(id, line_id)).toBe("edges");
      expect(dataStyleStore.modelLinesEdgeAttributeValue(id, line_id).item).toBe(2);
      expect(dataStyleStore.modelLinesEdgeAttributeRange(id, line_id)).toStrictEqual([
        MINIMUM_RANGE,
        MAXIMUM_RANGE,
      ]);
      expect(dataStyleStore.modelLinesEdgeAttributeColorMap(id, line_id)).toBe("discrete:budaS");
    });
  });

  describe("lines style", () => {
    test("lines apply style", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const result = dataStyleStore.applyModelLinesStyle(id);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });

  describe("line component active coloring", () => {
    test("coloring color", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const dataStore = useDataStore();
      const line_ids = await dataStore.getLinesGeodeIds(id);
      const [line_id] = line_ids;
      const coloringName = "constant";
      const result = dataStyleStore.setModelComponentActiveColoring(id, line_id, coloringName);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(dataStyleStore.modelLineActiveColoring(id, line_id)).toBe(coloringName);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("coloring vertex", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const dataStore = useDataStore();
      const line_ids = await dataStore.getLinesGeodeIds(id);
      const [line_id] = line_ids;
      await dataStyleStore.setModelLinesVertexAttributeName(id, [line_id], "points");
      const coloringName = "vertex";
      const result = dataStyleStore.setModelComponentActiveColoring(id, line_id, coloringName);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(dataStyleStore.modelLineActiveColoring(id, line_id)).toBe(coloringName);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("coloring edge", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const dataStore = useDataStore();
      const line_ids = await dataStore.getLinesGeodeIds(id);
      const [line_id] = line_ids;
      await dataStyleStore.setModelLinesEdgeAttributeName(id, [line_id], "test_attribute");
      const coloringName = "edge";
      const result = dataStyleStore.setModelComponentActiveColoring(id, line_id, coloringName);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(dataStyleStore.modelLineActiveColoring(id, line_id)).toBe(coloringName);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });
});
