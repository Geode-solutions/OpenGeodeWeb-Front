// Third party imports
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import { beforeAllTimeout, setupIntegrationTests } from "@ogw_tests/integration/setup";
import { DEFAULT_NO_DATA_COLOR } from "@ogw_front/utils/default_styles/constants";
import { cleanupBackend } from "@ogw_server/utils/cleanup";
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.model.surfaces.attribute.polygon.attribute;
const file_name = "model_time_series.og_brep";
const geode_object = "BRep";
const colorMap = "batlow";
const points = getRGBPointsFromPreset(colorMap);
const SURFACES_TIME_STEP = 2;
const LINES_TIME_STEP = 4;
const temperature = { name: "temperature", item: 0, minimum: 0, maximum: 50, colorMap };

let id = "";
let projectFolderPath = "";

describe("model time series", () => {
  beforeAll(async () => {
    ({ id, projectFolderPath } = await setupIntegrationTests(file_name, geode_object));
  }, beforeAllTimeout);

  afterAll(async () => {
    await cleanupBackend(projectFolderPath);
  });

  test("sends the time step array name for the surfaces", async () => {
    const dataStyleStore = useDataStyleStore();
    const viewerStore = useViewerStore();
    const dataStore = useDataStore();
    const surface_ids = await dataStore.getSurfacesGeodeIds(id);
    const surface_viewer_ids = await dataStore.getMeshComponentsViewerIds(id, surface_ids);
    const spy = vi.spyOn(viewerStore, "request");
    await dataStyleStore.setModelSurfacesPolygonAttribute(id, surface_ids, temperature);
    await dataStyleStore.setModelSurfacesPolygonAttributeTimeStep(
      id,
      surface_ids,
      SURFACES_TIME_STEP,
    );
    const params = {
      id,
      block_ids: surface_viewer_ids,
      name: `${temperature.name}@${SURFACES_TIME_STEP}`,
      item: temperature.item,
      points,
      minimum: temperature.minimum,
      maximum: temperature.maximum,
      no_data_color: DEFAULT_NO_DATA_COLOR,
    };
    expect(spy).toHaveBeenCalledWith({ schema, params });
  });

  test("keeps one time step per component type", async () => {
    const dataStyleStore = useDataStyleStore();
    const dataStore = useDataStore();
    const surface_ids = await dataStore.getSurfacesGeodeIds(id);
    const line_ids = await dataStore.getLinesGeodeIds(id);
    await dataStyleStore.setModelLinesEdgeAttribute(id, line_ids, temperature);
    expect(dataStyleStore.modelLinesEdgeAttributeTimeStep(id, line_ids[0])).toBeUndefined();
    await dataStyleStore.setModelLinesEdgeAttributeTimeStep(id, line_ids, LINES_TIME_STEP);
    expect(dataStyleStore.modelLinesEdgeAttributeTimeStep(id, line_ids[0])).toBe(LINES_TIME_STEP);
    expect(dataStyleStore.modelSurfacesPolygonAttributeTimeStep(id, surface_ids[0])).toBe(
      SURFACES_TIME_STEP,
    );
  });
});
