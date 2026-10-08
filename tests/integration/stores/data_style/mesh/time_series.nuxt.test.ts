// Third party imports
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import { beforeAllTimeout, setupIntegrationTests } from "@ogw_tests/integration/setup";
import { DEFAULT_NO_DATA_COLOR } from "@ogw_front/utils/default_styles/constants";
import { cleanupBackend } from "@ogw_server/utils/cleanup";
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.polygons.attribute.vertex.attribute;
const file_name = "time_series.og_psf3d";
const geode_object = "PolygonalSurface3D";
const colorMap = "batlow";
const points = getRGBPointsFromPreset(colorMap);
const MINIMUM_RANGE = 0.25;
const MAXIMUM_RANGE = 0.75;
const LAST_TIME_STEP = 2;
const vertex_attribute = { name: "temperature", item: 0, minimum: 0, maximum: 1, colorMap };

let id = "";
let projectFolderPath = "";

describe("mesh polygons vertex time series", () => {
  beforeAll(async () => {
    ({ id, projectFolderPath } = await setupIntegrationTests(file_name, geode_object));
  }, beforeAllTimeout);

  afterAll(async () => {
    await cleanupBackend(projectFolderPath);
  });

  test("sends the time step array name to the viewer", async () => {
    const dataStyleStore = useDataStyleStore();
    const viewerStore = useViewerStore();
    const spy = vi.spyOn(viewerStore, "request");
    await dataStyleStore.setMeshPolygonsVertexAttribute(id, vertex_attribute);
    await dataStyleStore.setMeshPolygonsVertexAttributeTimeStep(id, LAST_TIME_STEP);
    const params = {
      id,
      name: `${vertex_attribute.name}@${LAST_TIME_STEP}`,
      item: vertex_attribute.item,
      points,
      minimum: vertex_attribute.minimum,
      maximum: vertex_attribute.maximum,
      no_data_color: DEFAULT_NO_DATA_COLOR,
    };
    expect(spy).toHaveBeenCalledWith({ schema, params });
    expect(dataStyleStore.meshPolygonsVertexAttributeTimeStep(id)).toBe(LAST_TIME_STEP);
  });

  test("keeps the range when the time step changes", async () => {
    const dataStyleStore = useDataStyleStore();
    await dataStyleStore.setMeshPolygonsVertexAttributeRange(id, MINIMUM_RANGE, MAXIMUM_RANGE);
    await dataStyleStore.setMeshPolygonsVertexAttributeTimeStep(id, 1);
    expect(dataStyleStore.meshPolygonsVertexAttributeRange(id)).toStrictEqual([
      MINIMUM_RANGE,
      MAXIMUM_RANGE,
    ]);
  });

  test("keeps the time step when styles are re-applied", async () => {
    const dataStyleStore = useDataStyleStore();
    const viewerStore = useViewerStore();
    await dataStyleStore.setMeshPolygonsActiveColoring(id, "vertex");
    const spy = vi.spyOn(viewerStore, "request");
    await dataStyleStore.applyMeshPolygonsStyle(id);
    const params = {
      id,
      name: `${vertex_attribute.name}@1`,
      item: vertex_attribute.item,
      points,
      minimum: MINIMUM_RANGE,
      maximum: MAXIMUM_RANGE,
      no_data_color: DEFAULT_NO_DATA_COLOR,
    };
    expect(spy).toHaveBeenCalledWith({ schema, params });
  });

  test("shares the time step between cards showing the same series", async () => {
    const dataStyleStore = useDataStyleStore();
    const viewerStore = useViewerStore();
    await dataStyleStore.setMeshPointsVertexAttribute(id, { ...vertex_attribute });
    await dataStyleStore.setMeshPointsActiveColoring(id, "vertex");
    const spy = vi.spyOn(viewerStore, "request");
    await dataStyleStore.setMeshPolygonsVertexAttributeTimeStep(id, LAST_TIME_STEP);
    const pointsSchema = viewer_schemas.opengeodeweb_viewer.mesh.points.attribute.vertex.attribute;
    const params = {
      id,
      name: `${vertex_attribute.name}@${LAST_TIME_STEP}`,
      item: vertex_attribute.item,
      points,
      minimum: vertex_attribute.minimum,
      maximum: vertex_attribute.maximum,
      no_data_color: DEFAULT_NO_DATA_COLOR,
    };
    expect(spy).toHaveBeenCalledWith({ schema: pointsSchema, params });
    expect(dataStyleStore.meshPointsVertexAttributeTimeStep(id)).toBe(LAST_TIME_STEP);
  });

  test("sends the plain name for a non temporal attribute", async () => {
    const dataStyleStore = useDataStyleStore();
    const viewerStore = useViewerStore();
    const spy = vi.spyOn(viewerStore, "request");
    await dataStyleStore.setMeshPolygonsVertexAttribute(id, {
      ...vertex_attribute,
      name: "points",
    });
    const params = {
      id,
      name: "points",
      item: vertex_attribute.item,
      points,
      minimum: vertex_attribute.minimum,
      maximum: vertex_attribute.maximum,
      no_data_color: DEFAULT_NO_DATA_COLOR,
    };
    expect(spy).toHaveBeenCalledWith({ schema, params });
    expect(dataStyleStore.meshPolygonsVertexAttributeTimeStep(id)).toBeUndefined();
  });
});
