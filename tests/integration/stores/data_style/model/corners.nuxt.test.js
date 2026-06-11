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
const model_corners_schemas = viewer_schemas.opengeodeweb_viewer.model.corners;
const file_name = "test.og_brep";
const geode_object = "BRep";
const SLEEP_MS = 200;

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
    test("coloring vertex attribute", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const dataStore = useDataStore();
      const corner_ids = await dataStore.getCornersGeodeIds(id);
      const corner_viewer_ids = await dataStore.getMeshComponentsViewerIds(id, corner_ids);
      const spy = vi.spyOn(viewerStore, "request");
      spy.mockClear();
      const result = dataStyleStore.setModelCornersVertexAttributeName(id, corner_ids, "points");
      expect(result).toBeInstanceOf(Promise);
      await result;
      await sleep(SLEEP_MS);
      expect(spy).toHaveBeenCalledWith(
        {
          schema: model_corners_schemas.attribute.vertex.name,
          params: {
            id,
            block_ids: corner_viewer_ids,
            name: "points",
          },
        },
        {
          response_function: expect.any(Function),
        },
      );
      for (const corner_id of corner_ids) {
        expect(dataStyleStore.modelCornersVertexAttributeName(id, corner_id)).toBe("points");
      }
      expect(viewerStore.status).toBe(Status.CONNECTED);
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
      const result = dataStyleStore.setModelComponentColorMode(id, corner_id, coloringName);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(dataStyleStore.modelCornerColorMode(id, corner_id)).toBe(coloringName);
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
      const result = dataStyleStore.setModelComponentColorMode(id, corner_id, coloringName);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(dataStyleStore.modelCornerColorMode(id, corner_id)).toBe(coloringName);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });
});
