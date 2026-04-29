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
const model_points_schemas = viewer_schemas.opengeodeweb_viewer.model.points;
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

describe("model points", () => {
  beforeAll(async () => {
    ({ id, projectFolderPath } = await setupIntegrationTests(file_name, geode_object));
  }, beforeAllTimeout);

  afterAll(async () => {
    console.log("afterAll model points kill", projectFolderPath);
    await cleanupBackend(projectFolderPath);
  });

  describe("points visibility", () => {
    test("visibility true", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const visibility = true;
      const spy = vi.spyOn(viewerStore, "request");
      spy.mockClear();
      const result = dataStyleStore.setModelPointsVisibility(id, visibility);
      expect(result).toBeInstanceOf(Promise);
      await result;
      await sleep(SLEEP_MS);
      expect(spy).toHaveBeenCalledWith(
        model_points_schemas.visibility,
        { id, visibility },
        {
          response_function: expect.any(Function),
        },
      );
      expect(dataStyleStore.modelPointsVisibility(id)).toBe(visibility);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });

  describe("points size", () => {
    test("size 20", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const size = 20;
      const spy = vi.spyOn(viewerStore, "request");
      spy.mockClear();
      const result = dataStyleStore.setModelPointsSize(id, size);
      expect(result).toBeInstanceOf(Promise);
      await result;
      await sleep(SLEEP_MS);
      expect(spy).toHaveBeenCalledWith(
        model_points_schemas.size,
        { id, size },
        {
          response_function: expect.any(Function),
        },
      );
      expect(dataStyleStore.modelPointsSize(id)).toBe(size);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });
  describe("points style", () => {
    test("points apply style", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const result = dataStyleStore.applyModelPointsStyle(id);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });
});
