// Third party imports
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json" with { type: "json" };

// Local imports
import { beforeAllTimeout, setupIntegrationTests } from "@ogw_tests/integration/setup";
import { Status } from "@ogw_front/utils/status";
import { cleanupBackend } from "@ogw_server/utils/cleanup";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const model_corners_schemas = viewer_schemas.opengeodeweb_viewer.model.corners;
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

describe("model corners", () => {
  beforeAll(async () => {
    ({ id, projectFolderPath } = await setupIntegrationTests(file_name, geode_object));
  }, beforeAllTimeout);

  afterAll(async () => {
    console.log("afterAll model corners kill", projectFolderPath);
    await cleanupBackend(projectFolderPath);
  });

  describe("corners visibility", () => {
    test("visibility false", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const dataStore = useDataStore();
      const corner_ids = await dataStore.getCornersGeodeIds(id);
      const corner_viewer_ids = await dataStore.getMeshComponentsViewerIds(id, corner_ids);
      const visibility = false;
      const spy = vi.spyOn(viewerStore, "request");
      spy.mockClear();
      const result = dataStyleStore.setModelCornersVisibility(id, corner_ids, visibility);
      expect(result).toBeInstanceOf(Promise);
      await result;
      await sleep(SLEEP_MS);
      const schema = model_corners_schemas.visibility;
      const params = { id, block_ids: corner_viewer_ids, visibility };
      expect(spy).toHaveBeenCalledWith(
        { schema, params },
        {
          response_function: expect.any(Function),
        },
      );
      for (const corner_id of corner_ids) {
        expect(dataStyleStore.modelCornerVisibility(id, corner_id)).toBe(visibility);
      }
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });

  describe("corner color", () => {
    test("color red", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const dataStore = useDataStore();
      const corner_ids = await dataStore.getCornersGeodeIds(id);
      const corner_viewer_ids = await dataStore.getMeshComponentsViewerIds(id, corner_ids);
      const color = { red: 255, green: 0, blue: 0, alpha: 1 };
      const spy = vi.spyOn(viewerStore, "request");
      spy.mockClear();
      const result = dataStyleStore.setModelCornersColor(id, corner_ids, color);
      expect(result).toBeInstanceOf(Promise);
      await result;
      await sleep(SLEEP_MS);
      const schema = model_corners_schemas.color;
      const params = { id, block_ids: corner_viewer_ids, color, color_mode: "constant" };
      expect(spy).toHaveBeenCalledWith(
        { schema, params },
        {
          response_function: expect.any(Function),
        },
      );
      for (const corner_id of corner_ids) {
        expect(dataStyleStore.modelCornerColor(id, corner_id)).toStrictEqual(color);
      }
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });

  describe("corners vertex attribute", () => {
    test("coloring vertex attribute — no request until range+colormap set", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const dataStore = useDataStore();
      const corner_ids = await dataStore.getCornersGeodeIds(id);
      const spy = vi.spyOn(viewerStore, "request");
      spy.mockClear();
      const result = dataStyleStore.setModelCornersVertexAttributeName(id, corner_ids, "points");
      expect(result).toBeInstanceOf(Promise);
      await result;
      await sleep(SLEEP_MS);
      // No request sent yet since minimum/maximum/colorMap are still undefined
      expect(spy).not.toHaveBeenCalled();
      for (const corner_id of corner_ids) {
        expect(dataStyleStore.modelCornersVertexAttributeName(id, corner_id)).toBe("points");
      }
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("coloring vertex attribute — request sent when all params defined", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const dataStore = useDataStore();
      const corner_ids = await dataStore.getCornersGeodeIds(id);
      const corner_viewer_ids = await dataStore.getMeshComponentsViewerIds(id, corner_ids);
      const spy = vi.spyOn(viewerStore, "request");
      spy.mockClear();
      await dataStyleStore.setModelCornersVertexAttributeName(id, corner_ids, "points");
      await dataStyleStore.setModelCornersVertexAttributeRange(
        id,
        corner_ids,
        MINIMUM_RANGE,
        MAXIMUM_RANGE,
      );
      await dataStyleStore.setModelCornersVertexAttributeColorMap(id, corner_ids, "budaS");
      await sleep(SLEEP_MS);
      const [lastCall] = spy.mock.calls.slice(-1);
      expect(lastCall[0].schema).toStrictEqual(model_corners_schemas.attribute.vertex.attribute);
      expect(lastCall[0].params).toStrictEqual(
        expect.objectContaining({
          id,
          block_ids: corner_viewer_ids,
          name: "points",
          item: 0,
          minimum: MINIMUM_RANGE,
          maximum: MAXIMUM_RANGE,
        }),
      );
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("stored configs 1 - select attribute points and item 2", async () => {
      const dataStyleStore = useDataStyleStore();
      const dataStore = useDataStore();
      const corner_ids = await dataStore.getCornersGeodeIds(id);
      const [corner_id] = corner_ids;
      await dataStyleStore.setModelCornersVertexAttributeName(id, corner_ids, "points");
      await dataStyleStore.setModelCornersVertexAttributeItem(id, corner_ids, 2);
      expect(dataStyleStore.modelCornersVertexAttributeName(id, corner_id)).toBe("points");
      expect(dataStyleStore.modelCornersVertexAttributeItem(id, corner_id)).toBe(2);
    });

    test("stored configs 2 - set range and colormap", async () => {
      const dataStyleStore = useDataStyleStore();
      const dataStore = useDataStore();
      const corner_ids = await dataStore.getCornersGeodeIds(id);
      const [corner_id] = corner_ids;
      await dataStyleStore.setModelCornersVertexAttributeRange(
        id,
        corner_ids,
        MINIMUM_RANGE,
        MAXIMUM_RANGE,
      );
      await dataStyleStore.setModelCornersVertexAttributeColorMap(id, corner_ids, "budaS");
      await sleep(SLEEP_MS);
      expect(dataStyleStore.modelCornersVertexAttributeRange(id, corner_id)).toStrictEqual([
        MINIMUM_RANGE,
        MAXIMUM_RANGE,
      ]);
      expect(dataStyleStore.modelCornersVertexAttributeColorMap(id, corner_id)).toBe("budaS");
    });

    test("stored configs 3 - select unique_vertices", async () => {
      const dataStyleStore = useDataStyleStore();
      const dataStore = useDataStore();
      const corner_ids = await dataStore.getCornersGeodeIds(id);
      const [corner_id] = corner_ids;
      await dataStyleStore.setModelCornersVertexAttributeName(id, corner_ids, "unique_vertices");
      await dataStyleStore.setModelCornersVertexAttributeItem(id, corner_ids, 0);
      expect(dataStyleStore.modelCornersVertexAttributeName(id, corner_id)).toBe("unique_vertices");
      expect(dataStyleStore.modelCornersVertexAttributeItem(id, corner_id)).toBe(0);
    });

    test("stored configs 4 - switch back to points and verify restoration", async () => {
      const dataStyleStore = useDataStyleStore();
      const dataStore = useDataStore();
      const corner_ids = await dataStore.getCornersGeodeIds(id);
      const [corner_id] = corner_ids;
      await dataStyleStore.setModelCornersVertexAttributeName(id, corner_ids, "points");
      expect(dataStyleStore.modelCornersVertexAttributeName(id, corner_id)).toBe("points");
      expect(dataStyleStore.modelCornersVertexAttributeItem(id, corner_id)).toBe(2);
      expect(dataStyleStore.modelCornersVertexAttributeRange(id, corner_id)).toStrictEqual([
        MINIMUM_RANGE,
        MAXIMUM_RANGE,
      ]);
      expect(dataStyleStore.modelCornersVertexAttributeColorMap(id, corner_id)).toBe("budaS");
    });
  });

  describe("corner style", () => {
    test("corners apply style", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const result = dataStyleStore.applyModelCornersStyle(id);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });

  describe("corner component active coloring", () => {
    test("coloring color", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const dataStore = useDataStore();
      const corner_ids = await dataStore.getCornersGeodeIds(id);
      const [corner_id] = corner_ids;
      const coloringName = "constant";
      const result = dataStyleStore.setModelComponentActiveColoring(id, corner_id, coloringName);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(dataStyleStore.modelCornerActiveColoring(id, corner_id)).toBe(coloringName);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("coloring vertex", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const dataStore = useDataStore();
      const corner_ids = await dataStore.getCornersGeodeIds(id);
      const [corner_id] = corner_ids;
      await dataStyleStore.setModelCornersVertexAttributeName(id, [corner_id], "points");
      const coloringName = "vertex";
      const result = dataStyleStore.setModelComponentActiveColoring(id, corner_id, coloringName);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(dataStyleStore.modelCornerActiveColoring(id, corner_id)).toBe(coloringName);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });
});
