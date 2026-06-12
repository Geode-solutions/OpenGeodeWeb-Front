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
const model_schemas = viewer_schemas.opengeodeweb_viewer.model;
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

describe("model", () => {
  beforeAll(async () => {
    ({ id, projectFolderPath } = await setupIntegrationTests(file_name, geode_object));
  }, beforeAllTimeout);

  afterAll(async () => {
    console.log("afterAll model kill", projectFolderPath);
    await cleanupBackend(projectFolderPath);
  });

  describe("model visibility", () => {
    test("visibility true", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const visibility = true;
      const spy = vi.spyOn(viewerStore, "request");
      spy.mockClear();
      const result = dataStyleStore.setModelVisibility(id, visibility);
      expect(result).toBeInstanceOf(Promise);
      await result;
      await sleep(SLEEP_MS);
      const schema = model_schemas.visibility;
      const params = { id, visibility };
      expect(spy).toHaveBeenCalledWith(
        { schema, params },
        {
          response_function: expect.any(Function),
        },
      );
      expect(dataStyleStore.modelVisibility(id)).toBe(visibility);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });

  describe("model color inheritance", () => {
    test("inheritance workflow model > surfaces > surface", async () => {
      const dataStyleStore = useDataStyleStore();
      const dataStore = useDataStore();

      const surface_ids = await dataStore.getSurfacesGeodeIds(id);
      const [surface_id] = surface_ids;

      const red = { red: 255, green: 0, blue: 0, alpha: 1 };
      const green = { red: 0, green: 255, blue: 0, alpha: 1 };
      const blue = { red: 0, green: 0, blue: 255, alpha: 1 };

      await dataStyleStore.mutateStyle(id, {
        coloring: { constant: red, active: "constant" },
      });
      await dataStyleStore.setModelComponentsColor(id, surface_ids, red);
      await sleep(SLEEP_MS);

      await dataStyleStore.setModelComponentTypeColor(id, "Surface", green);
      await sleep(SLEEP_MS);

      await dataStyleStore.setModelSurfacesColor(id, [surface_id], blue);
      await sleep(SLEEP_MS);

      expect(dataStyleStore.getModelColor(id)).toStrictEqual(red);
      expect(dataStyleStore.modelComponentTypeColor(id, "Surface")).toStrictEqual(green);
      expect(dataStyleStore.modelSurfaceColor(id, surface_id)).toStrictEqual(blue);
    });
  });
});
