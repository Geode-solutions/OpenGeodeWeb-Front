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
      expect(spy).toHaveBeenCalledWith(
        model_lines_schemas.visibility,
        {
          id,
          block_ids: lines_viewer_ids,
          visibility,
        },
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
      expect(spy).toHaveBeenCalledWith(
        model_lines_schemas.color,
        {
          id,
          block_ids: lines_viewer_ids,
          color,
          color_mode: "constant",
        },
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
});
