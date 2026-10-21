// Third party imports
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import { beforeAllTimeout, setupIntegrationTests } from "@ogw_tests/integration/setup";
import { DEFAULT_NO_DATA_COLOR } from "@ogw_front/utils/default_styles/constants";
import { Status } from "@ogw_front/utils/status";
import { cleanupBackend } from "@ogw_server/utils/cleanup";
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const model_lines_points_schemas = viewer_schemas.opengeodeweb_viewer.model.lines.points;
const file_name = "test.og_brep";
const geode_object = "BRep";
const SLEEP_MS = 200;
const POINTS_SIZE = 8;
const MINIMUM_RANGE = 10;
const MAXIMUM_RANGE = 20;
const TEST_TIMEOUT_MS = 15_000;

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

describe("model lines points", () => {
  beforeAll(async () => {
    ({ id, projectFolderPath } = await setupIntegrationTests(file_name, geode_object));
  }, beforeAllTimeout);

  afterAll(async () => {
    await cleanupBackend(projectFolderPath);
  });

  test(
    "lines points visibility and size",
    async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const dataStore = useDataStore();
      const line_ids = await dataStore.getLinesGeodeIds(id);
      const block_ids = await dataStore.getMeshComponentsViewerIds(id, line_ids);
      const spy = vi.spyOn(viewerStore, "request");
      spy.mockClear();
      await dataStyleStore.setModelLinesPointsVisibility(id, line_ids, true);
      await dataStyleStore.setModelLinesPointsSize(id, line_ids, POINTS_SIZE);
      await sleep(SLEEP_MS);
      expect(spy).toHaveBeenCalledWith(
        {
          schema: model_lines_points_schemas.visibility,
          params: { id, block_ids, visibility: true },
        },
        {
          // oxlint-disable-next-line no-unsafe-assignment -- expect.any(Function) is untyped by design, this is a vitest matcher not a real callback.
          response_function: expect.any(Function),
        },
      );
      expect(spy).toHaveBeenCalledWith(
        {
          schema: model_lines_points_schemas.size,
          params: { id, block_ids, size: POINTS_SIZE },
        },
        {
          // oxlint-disable-next-line no-unsafe-assignment -- expect.any(Function) is untyped by design, this is a vitest matcher not a real callback.
          response_function: expect.any(Function),
        },
      );
      for (const line_id of line_ids) {
        expect(dataStyleStore.modelLinePointsVisibility(id, line_id)).toBe(true);
        expect(dataStyleStore.modelLinePointsSize(id, line_id)).toBe(POINTS_SIZE);
      }
      expect(viewerStore.status).toBe(Status.CONNECTED);
    },
    TEST_TIMEOUT_MS,
  );

  test(
    "single line points color with opacity",
    async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const dataStore = useDataStore();
      const line_id = firstElement(await dataStore.getLinesGeodeIds(id));
      const block_ids = await dataStore.getMeshComponentsViewerIds(id, [line_id]);
      const color = { red: 255, green: 0, blue: 0, alpha: 0.5 };
      const spy = vi.spyOn(viewerStore, "request");
      spy.mockClear();
      await dataStyleStore.setModelLinesPointsColor(id, [line_id], color);
      await sleep(SLEEP_MS);
      expect(spy).toHaveBeenCalledWith(
        { schema: model_lines_points_schemas.color, params: { id, block_ids, color } },
        {
          // oxlint-disable-next-line no-unsafe-assignment -- expect.any(Function) is untyped by design, this is a vitest matcher not a real callback.
          response_function: expect.any(Function),
        },
      );
      expect(dataStyleStore.modelLinePointsColor(id, line_id)).toStrictEqual(color);
      expect(dataStyleStore.modelLinePointsActiveColoring(id, line_id)).toBe("constant");
    },
    TEST_TIMEOUT_MS,
  );

  test(
    "lines points vertex attribute",
    async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const dataStore = useDataStore();
      const line_ids = await dataStore.getLinesGeodeIds(id);
      const block_ids = await dataStore.getMeshComponentsViewerIds(id, line_ids);
      const name = "points";
      const colorMap = "batlow";
      await dataStyleStore.setModelLinesPointsVertexAttributeName(id, line_ids, name);
      await dataStyleStore.setModelLinesPointsVertexAttributeColorMap(id, line_ids, colorMap);
      const spy = vi.spyOn(viewerStore, "request");
      spy.mockClear();
      await dataStyleStore.setModelLinesPointsVertexAttributeRange(
        id,
        line_ids,
        MINIMUM_RANGE,
        MAXIMUM_RANGE,
      );
      await sleep(SLEEP_MS);
      const params = {
        id,
        block_ids,
        name,
        item: 0,
        points: [...getRGBPointsFromPreset(colorMap)],
        minimum: MINIMUM_RANGE,
        maximum: MAXIMUM_RANGE,
        no_data_color: DEFAULT_NO_DATA_COLOR,
      };
      expect(spy).toHaveBeenCalledWith(
        { schema: model_lines_points_schemas.attribute.vertex.attribute, params },
        {
          // oxlint-disable-next-line no-unsafe-assignment -- expect.any(Function) is untyped by design, this is a vitest matcher not a real callback.
          response_function: expect.any(Function),
        },
      );
      const line_id = firstElement(line_ids);
      expect(dataStyleStore.modelLinePointsActiveColoring(id, line_id)).toBe("vertex");
      expect(dataStyleStore.modelLinePointsVertexAttributeName(id, line_id)).toBe(name);
    },
    TEST_TIMEOUT_MS,
  );
});
