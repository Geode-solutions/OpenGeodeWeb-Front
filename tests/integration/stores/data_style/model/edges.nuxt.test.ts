// Third party imports
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import { beforeAllTimeout, setupIntegrationTests } from "@ogw_tests/integration/setup";
import { Status } from "@ogw_front/utils/status";
import { cleanupBackend } from "@ogw_server/utils/cleanup";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const model_edges_schemas = viewer_schemas.opengeodeweb_viewer.model.edges;
const file_name = "test.og_brep";
const geode_object = "BRep";
const SLEEP_MS = 200;
const COMPONENT_EDGES_WIDTH = 8;
const MODEL_EDGES_WIDTH = 1;

async function sleep(milliseconds: number): Promise<void> {
  // oxlint-disable-next-line promise/avoid-new
  await new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function firstElement<Item>(array: readonly Item[]): Item {
  const [element] = array;
  if (element === undefined) {
    throw new Error("Expected array to contain at least one element");
  }
  return element;
}

let id = "";
let projectFolderPath = "";

describe("model edges", () => {
  beforeAll(async () => {
    ({ id, projectFolderPath } = await setupIntegrationTests(file_name, geode_object));
  }, beforeAllTimeout);

  afterAll(async () => {
    await cleanupBackend(projectFolderPath);
  });

  describe("edges visibility", () => {
    test("visibility true", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const visibility = true;
      const spy = vi.spyOn(viewerStore, "request");
      spy.mockClear();
      const result = dataStyleStore.setModelEdgesVisibility(id, visibility);
      expect(result).toBeInstanceOf(Promise);
      await result;
      await sleep(SLEEP_MS);
      const schema = model_edges_schemas.visibility;
      const params = { id, visibility };
      expect(spy).toHaveBeenCalledWith(
        { schema, params },
        {
          // oxlint-disable-next-line no-unsafe-assignment -- expect.any(Function) is untyped by design, this is a vitest matcher not a real callback.
          response_function: expect.any(Function),
        },
      );
      expect(dataStyleStore.modelEdgesVisibility(id)).toBe(visibility);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });
  describe("edges width", () => {
    test("model edges width overrides components", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const dataStore = useDataStore();
      const surface_id = firstElement(await dataStore.getSurfacesGeodeIds(id));
      await dataStyleStore.setModelSurfacesEdgesWidth(id, [surface_id], COMPONENT_EDGES_WIDTH);
      const spy = vi.spyOn(viewerStore, "request");
      spy.mockClear();
      await dataStyleStore.setModelEdgesWidth(id, MODEL_EDGES_WIDTH);
      await sleep(SLEEP_MS);
      expect(spy).toHaveBeenCalledWith(
        { schema: model_edges_schemas.width, params: { id, width: MODEL_EDGES_WIDTH } },
        {
          // oxlint-disable-next-line no-unsafe-assignment -- expect.any(Function) is untyped by design, this is a vitest matcher not a real callback.
          response_function: expect.any(Function),
        },
      );
      expect(dataStyleStore.modelEdgesWidth(id)).toBe(MODEL_EDGES_WIDTH);
      expect(dataStyleStore.modelSurfaceEdgesWidth(id, surface_id)).toBe(MODEL_EDGES_WIDTH);
    });
  });
  describe("edges style", () => {
    test("edges apply style", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const result = dataStyleStore.applyModelEdgesStyle(id);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });
});
