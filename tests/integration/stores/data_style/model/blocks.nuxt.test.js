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
      expect(spy).toHaveBeenCalledWith(
        model_blocks_schemas.visibility,
        {
          id,
          block_ids: block_viewer_ids,
          visibility,
        },
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
      expect(spy).toHaveBeenCalledWith(
        model_blocks_schemas.color,
        {
          id,
          block_ids: block_viewer_ids,
          color,
          color_mode: "constant",
        },
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
});
