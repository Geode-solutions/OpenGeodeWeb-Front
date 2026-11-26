// oxlint-disable max-lines
// Third party imports
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import { assertDefined, assertNonEmpty } from "@ogw_tests/utils";
import { beforeAllTimeout, setupIntegrationTests } from "@ogw_tests/integration/setup";
import { DEFAULT_NO_DATA_COLOR } from "@ogw_front/utils/default_styles/constants";
import { Status } from "@ogw_front/utils/status";
import { cleanupBackend } from "@ogw_server/utils/cleanup";
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { isAttributeValid } from "@ogw_internal/stores/data_style/attribute_valid";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const model_surfaces_schemas = viewer_schemas.opengeodeweb_viewer.model.surfaces;
const file_name = "test.og_brep";
const geode_object = "BRep";
const SLEEP_MS = 200;
const MINIMUM_RANGE = 10;
const MAXIMUM_RANGE = 20;
const MAX_RANGE_TEST_VALUE = 100;
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

describe("model surfaces", () => {
  beforeAll(async () => {
    ({ id, projectFolderPath } = await setupIntegrationTests(file_name, geode_object));
  }, beforeAllTimeout);

  afterAll(async () => {
    await cleanupBackend(projectFolderPath);
  });
  describe("surfaces visibility", () => {
    test(
      "visibility true",
      async () => {
        const dataStyleStore = useDataStyleStore();
        const viewerStore = useViewerStore();
        const dataStore = useDataStore();
        const surface_ids = await dataStore.getSurfacesGeodeIds(id);
        const surface_viewer_ids = await dataStore.getMeshComponentsViewerIds(id, surface_ids);
        const visibility = true;
        const spy = vi.spyOn(viewerStore, "request");
        spy.mockClear();
        const result = dataStyleStore.setModelSurfacesVisibility(id, surface_ids, visibility);
        expect(result).toBeInstanceOf(Promise);
        await result;
        await sleep(SLEEP_MS);
        const schema = model_surfaces_schemas.visibility;
        const params = { id, block_ids: surface_viewer_ids, visibility };
        expect(spy).toHaveBeenCalledWith(
          { schema, params },
          {
            // oxlint-disable-next-line no-unsafe-assignment -- expect.any(Function) is untyped by design, this is a vitest matcher not a real callback.
            response_function: expect.any(Function),
          },
        );
        for (const surface_id of surface_ids) {
          expect(dataStyleStore.modelSurfaceVisibility(id, surface_id)).toBe(visibility);
        }
        expect(viewerStore.status).toBe(Status.CONNECTED);
      },
      TEST_TIMEOUT_MS,
    );
  });

  describe("surfaces color", () => {
    test(
      "color red",
      async () => {
        const dataStyleStore = useDataStyleStore();
        const viewerStore = useViewerStore();
        const dataStore = useDataStore();
        const surface_ids = await dataStore.getSurfacesGeodeIds(id);
        const surface_viewer_ids = await dataStore.getMeshComponentsViewerIds(id, surface_ids);
        const color = { red: 255, green: 0, blue: 0, alpha: 1 };
        const spy = vi.spyOn(viewerStore, "request");
        spy.mockClear();
        const result = dataStyleStore.setModelSurfacesColor(id, surface_ids, color);
        expect(result).toBeInstanceOf(Promise);
        await result;
        await sleep(SLEEP_MS);
        const schema = model_surfaces_schemas.color;
        const params = { id, block_ids: surface_viewer_ids, color, color_mode: "constant" };
        expect(spy).toHaveBeenCalledWith(
          { schema, params },
          {
            // oxlint-disable-next-line no-unsafe-assignment -- expect.any(Function) is untyped by design, this is a vitest matcher not a real callback.
            response_function: expect.any(Function),
          },
        );
        for (const surface_id of surface_ids) {
          expect(dataStyleStore.modelSurfaceColor(id, surface_id)).toStrictEqual(color);
        }
        expect(viewerStore.status).toBe(Status.CONNECTED);
      },
      TEST_TIMEOUT_MS,
    );
  });
  describe("surfaces vertex attribute", () => {
    test(
      "coloring vertex attribute",
      () => {
        expect(
          isAttributeValid({
            name: "points",
            item: 0,
            minimum: undefined,
            maximum: undefined,
            colorMap: undefined,
          }),
        ).toBe(false);
      },
      TEST_TIMEOUT_MS,
    );

    test(
      "coloring vertex attribute — direct set with full object",
      async () => {
        const dataStyleStore = useDataStyleStore();
        const viewerStore = useViewerStore();
        const dataStore = useDataStore();
        const surfaceIds = assertNonEmpty(await dataStore.getSurfacesGeodeIds(id));
        const surface_viewer_ids = await dataStore.getMeshComponentsViewerIds(id, surfaceIds);
        const spy = vi.spyOn(viewerStore, "request");
        spy.mockClear();
        const vertex_attribute = {
          name: "points",
          item: 0,
          minimum: MINIMUM_RANGE,
          maximum: MAXIMUM_RANGE,
          colorMap: "batlow",
        };
        const result = dataStyleStore.setModelSurfacesVertexAttribute(
          id,
          surfaceIds,
          vertex_attribute,
        );
        expect(result).toBeInstanceOf(Promise);
        await result;
        await sleep(SLEEP_MS);
        const schema = model_surfaces_schemas.attribute.vertex.attribute;
        const points = getRGBPointsFromPreset(vertex_attribute.colorMap);
        const params = {
          id,
          block_ids: surface_viewer_ids,
          name: vertex_attribute.name,
          item: vertex_attribute.item,
          points,
          minimum: vertex_attribute.minimum,
          maximum: vertex_attribute.maximum,
          no_data_color: DEFAULT_NO_DATA_COLOR,
        };
        expect(spy).toHaveBeenCalledWith({ schema, params });
        const surface_id = firstElement(surfaceIds);
        expect(dataStyleStore.modelSurfacesVertexAttributeName(id, surface_id)).toBe(
          vertex_attribute.name,
        );
        expect(viewerStore.status).toBe(Status.CONNECTED);
      },
      TEST_TIMEOUT_MS,
    );

    test(
      "coloring vertex attribute — item switching and stored configs restore",
      async () => {
        const dataStyleStore = useDataStyleStore();
        const dataStore = useDataStore();
        const surfaceIds = assertNonEmpty(await dataStore.getSurfacesGeodeIds(id));
        const surface_id = firstElement(surfaceIds);

        await dataStyleStore.setModelSurfacesVertexAttribute(id, surfaceIds, {
          name: "points",
          item: 0,
          minimum: MINIMUM_RANGE,
          maximum: MAXIMUM_RANGE,
          colorMap: "batlow",
        });

        await dataStyleStore.setModelSurfacesVertexAttributeItem(id, surfaceIds, 1);
        await dataStyleStore.setModelSurfacesVertexAttributeRange(
          id,
          surfaceIds,
          0,
          MAX_RANGE_TEST_VALUE,
        );
        await dataStyleStore.setModelSurfacesVertexAttributeColorMap(id, surfaceIds, "berlin");
        expect(dataStyleStore.modelSurfacesVertexAttributeItem(id, surface_id)).toBe(1);
        expect(dataStyleStore.modelSurfacesVertexAttributeRange(id, surface_id)).toStrictEqual([
          0,
          MAX_RANGE_TEST_VALUE,
        ]);
        expect(dataStyleStore.modelSurfacesVertexAttributeColorMap(id, surface_id)).toBe("berlin");

        await dataStyleStore.setModelSurfacesVertexAttributeItem(id, surfaceIds, 0);
        expect(dataStyleStore.modelSurfacesVertexAttributeItem(id, surface_id)).toBe(0);
        expect(dataStyleStore.modelSurfacesVertexAttributeRange(id, surface_id)).toStrictEqual([
          MINIMUM_RANGE,
          MAXIMUM_RANGE,
        ]);
        // oxlint-disable-next-line max-expects
        expect(dataStyleStore.modelSurfacesVertexAttributeColorMap(id, surface_id)).toBe("batlow");
      },
      TEST_TIMEOUT_MS,
    );

    test(
      "coloring vertex attribute — request sent when all params defined",
      async () => {
        const dataStyleStore = useDataStyleStore();
        const viewerStore = useViewerStore();
        const dataStore = useDataStore();
        const surfaceIds = assertNonEmpty(await dataStore.getSurfacesGeodeIds(id));
        const surface_viewer_ids = await dataStore.getMeshComponentsViewerIds(id, surfaceIds);
        const spy = vi.spyOn(viewerStore, "request");
        spy.mockClear();
        await dataStyleStore.setModelSurfacesVertexAttributeName(id, surfaceIds, "points");
        await dataStyleStore.setModelSurfacesVertexAttributeRange(
          id,
          surfaceIds,
          MINIMUM_RANGE,
          MAXIMUM_RANGE,
        );
        await dataStyleStore.setModelSurfacesVertexAttributeColorMap(id, surfaceIds, "budaS");
        await sleep(SLEEP_MS);
        const lastCall = assertDefined(spy.mock.calls.at(-1), "Expected spy to have been called");
        expect(lastCall[0].schema).toStrictEqual(model_surfaces_schemas.attribute.vertex.attribute);
        expect(lastCall[0].params).toStrictEqual(
          expect.objectContaining({
            id,
            block_ids: surface_viewer_ids,
            name: "points",
            item: 0,
            minimum: MINIMUM_RANGE,
            maximum: MAXIMUM_RANGE,
          }),
        );
        expect(viewerStore.status).toBe(Status.CONNECTED);
      },
      TEST_TIMEOUT_MS,
    );

    test(
      "stored configs 1 - select attribute points and item 2",
      async () => {
        const dataStyleStore = useDataStyleStore();
        const dataStore = useDataStore();
        const surfaceIds = assertNonEmpty(await dataStore.getSurfacesGeodeIds(id));
        const surface_id = firstElement(surfaceIds);
        await dataStyleStore.setModelSurfacesVertexAttributeName(id, surfaceIds, "points");
        await dataStyleStore.setModelSurfacesVertexAttributeItem(id, surfaceIds, 2);
        expect(dataStyleStore.modelSurfacesVertexAttributeName(id, surface_id)).toBe("points");
        expect(dataStyleStore.modelSurfacesVertexAttributeItem(id, surface_id)).toBe(2);
      },
      TEST_TIMEOUT_MS,
    );

    test(
      "stored configs 2 - set range and colormap",
      async () => {
        const dataStyleStore = useDataStyleStore();
        const dataStore = useDataStore();
        const surfaceIds = assertNonEmpty(await dataStore.getSurfacesGeodeIds(id));
        const surface_id = firstElement(surfaceIds);
        await dataStyleStore.setModelSurfacesVertexAttributeRange(
          id,
          surfaceIds,
          MINIMUM_RANGE,
          MAXIMUM_RANGE,
        );
        await dataStyleStore.setModelSurfacesVertexAttributeColorMap(id, surfaceIds, "budaS");
        await sleep(SLEEP_MS);
        expect(dataStyleStore.modelSurfacesVertexAttributeRange(id, surface_id)).toStrictEqual([
          MINIMUM_RANGE,
          MAXIMUM_RANGE,
        ]);
        expect(dataStyleStore.modelSurfacesVertexAttributeColorMap(id, surface_id)).toBe("budaS");
      },
      TEST_TIMEOUT_MS,
    );

    test(
      "stored configs 3 - select unique_vertices",
      async () => {
        const dataStyleStore = useDataStyleStore();
        const dataStore = useDataStore();
        const surfaceIds = assertNonEmpty(await dataStore.getSurfacesGeodeIds(id));
        const surface_id = firstElement(surfaceIds);
        await dataStyleStore.setModelSurfacesVertexAttributeName(id, surfaceIds, "unique_vertices");
        await dataStyleStore.setModelSurfacesVertexAttributeItem(id, surfaceIds, 0);
        expect(dataStyleStore.modelSurfacesVertexAttributeName(id, surface_id)).toBe(
          "unique_vertices",
        );
        expect(dataStyleStore.modelSurfacesVertexAttributeItem(id, surface_id)).toBe(0);
      },
      TEST_TIMEOUT_MS,
    );

    test(
      "stored configs 4 - switch back to points and verify restoration",
      async () => {
        const dataStyleStore = useDataStyleStore();
        const dataStore = useDataStore();
        const surfaceIds = assertNonEmpty(await dataStore.getSurfacesGeodeIds(id));
        const surface_id = firstElement(surfaceIds);
        await dataStyleStore.setModelSurfacesVertexAttributeName(id, surfaceIds, "points");
        expect(dataStyleStore.modelSurfacesVertexAttributeName(id, surface_id)).toBe("points");
        expect(dataStyleStore.modelSurfacesVertexAttributeItem(id, surface_id)).toBe(2);
        expect(dataStyleStore.modelSurfacesVertexAttributeRange(id, surface_id)).toStrictEqual([
          MINIMUM_RANGE,
          MAXIMUM_RANGE,
        ]);
        expect(dataStyleStore.modelSurfacesVertexAttributeColorMap(id, surface_id)).toBe("budaS");
      },
      TEST_TIMEOUT_MS,
    );
  });

  describe("surfaces polygon attribute", () => {
    test(
      "coloring polygon attribute — guard on missing parameters",
      () => {
        expect(
          isAttributeValid({
            name: "triangle_vertices",
            item: 0,
            minimum: undefined,
            maximum: undefined,
            colorMap: undefined,
          }),
        ).toBe(false);
      },
      TEST_TIMEOUT_MS,
    );

    test(
      "coloring polygon attribute — direct set with full object",
      async () => {
        const dataStyleStore = useDataStyleStore();
        const viewerStore = useViewerStore();
        const dataStore = useDataStore();
        const surfaceIds = assertNonEmpty(await dataStore.getSurfacesGeodeIds(id));
        const surface_viewer_ids = await dataStore.getMeshComponentsViewerIds(id, surfaceIds);
        const spy = vi.spyOn(viewerStore, "request");
        spy.mockClear();
        const polygon_attribute = {
          name: "triangle_vertices",
          item: 0,
          minimum: MINIMUM_RANGE,
          maximum: MAXIMUM_RANGE,
          colorMap: "batlow",
        };
        const result = dataStyleStore.setModelSurfacesPolygonAttribute(
          id,
          surfaceIds,
          polygon_attribute,
        );
        expect(result).toBeInstanceOf(Promise);
        await result;
        await sleep(SLEEP_MS);
        const schema = model_surfaces_schemas.attribute.polygon.attribute;
        const points = getRGBPointsFromPreset(polygon_attribute.colorMap);
        const params = {
          id,
          block_ids: surface_viewer_ids,
          name: polygon_attribute.name,
          item: polygon_attribute.item,
          points,
          minimum: polygon_attribute.minimum,
          maximum: polygon_attribute.maximum,
          no_data_color: DEFAULT_NO_DATA_COLOR,
        };
        expect(spy).toHaveBeenCalledWith({ schema, params });
        const surface_id = firstElement(surfaceIds);
        expect(dataStyleStore.modelSurfacesPolygonAttributeName(id, surface_id)).toBe(
          polygon_attribute.name,
        );
        expect(viewerStore.status).toBe(Status.CONNECTED);
      },
      TEST_TIMEOUT_MS,
    );

    test(
      "coloring polygon attribute — item switching and stored configs restore",
      async () => {
        const dataStyleStore = useDataStyleStore();
        const dataStore = useDataStore();
        const surfaceIds = assertNonEmpty(await dataStore.getSurfacesGeodeIds(id));
        const surface_id = firstElement(surfaceIds);

        await dataStyleStore.setModelSurfacesPolygonAttribute(id, surfaceIds, {
          name: "triangle_vertices",
          item: 0,
          minimum: MINIMUM_RANGE,
          maximum: MAXIMUM_RANGE,
          colorMap: "batlow",
        });

        await dataStyleStore.setModelSurfacesPolygonAttributeItem(id, surfaceIds, 1);
        await dataStyleStore.setModelSurfacesPolygonAttributeRange(
          id,
          surfaceIds,
          0,
          MAX_RANGE_TEST_VALUE,
        );
        await dataStyleStore.setModelSurfacesPolygonAttributeColorMap(id, surfaceIds, "berlin");
        expect(dataStyleStore.modelSurfacesPolygonAttributeItem(id, surface_id)).toBe(1);
        expect(dataStyleStore.modelSurfacesPolygonAttributeRange(id, surface_id)).toStrictEqual([
          0,
          MAX_RANGE_TEST_VALUE,
        ]);
        expect(dataStyleStore.modelSurfacesPolygonAttributeColorMap(id, surface_id)).toBe("berlin");

        await dataStyleStore.setModelSurfacesPolygonAttributeItem(id, surfaceIds, 0);
        expect(dataStyleStore.modelSurfacesPolygonAttributeItem(id, surface_id)).toBe(0);
        expect(dataStyleStore.modelSurfacesPolygonAttributeRange(id, surface_id)).toStrictEqual([
          MINIMUM_RANGE,
          MAXIMUM_RANGE,
        ]);
        // oxlint-disable-next-line max-expects
        expect(dataStyleStore.modelSurfacesPolygonAttributeColorMap(id, surface_id)).toBe("batlow");
      },
      TEST_TIMEOUT_MS,
    );

    test(
      "coloring polygon attribute — no request until range+colormap set",
      async () => {
        const dataStyleStore = useDataStyleStore();
        const viewerStore = useViewerStore();
        const dataStore = useDataStore();
        const surfaceIds = assertNonEmpty(await dataStore.getSurfacesGeodeIds(id));
        const spy = vi.spyOn(viewerStore, "request");
        spy.mockClear();
        const result = dataStyleStore.setModelSurfacesPolygonAttributeName(
          id,
          surfaceIds,
          "test_attribute",
        );
        expect(result).toBeInstanceOf(Promise);
        await result;
        await sleep(SLEEP_MS);
        // No request sent yet since minimum/maximum/colorMap are still undefined
        expect(spy).not.toHaveBeenCalled();
        for (const surface_id of surfaceIds) {
          expect(dataStyleStore.modelSurfacesPolygonAttributeName(id, surface_id)).toBe(
            "test_attribute",
          );
        }
        expect(viewerStore.status).toBe(Status.CONNECTED);
      },
      TEST_TIMEOUT_MS,
    );

    test(
      "coloring polygon attribute — request sent when all params defined",
      async () => {
        const dataStyleStore = useDataStyleStore();
        const viewerStore = useViewerStore();
        const dataStore = useDataStore();
        const surfaceIds = assertNonEmpty(await dataStore.getSurfacesGeodeIds(id));
        const surface_viewer_ids = await dataStore.getMeshComponentsViewerIds(id, surfaceIds);
        const spy = vi.spyOn(viewerStore, "request");
        spy.mockClear();
        await dataStyleStore.setModelSurfacesPolygonAttributeName(id, surfaceIds, "test_attribute");
        await dataStyleStore.setModelSurfacesPolygonAttributeRange(
          id,
          surfaceIds,
          MINIMUM_RANGE,
          MAXIMUM_RANGE,
        );
        await dataStyleStore.setModelSurfacesPolygonAttributeColorMap(id, surfaceIds, "budaS");
        await sleep(SLEEP_MS);
        const lastCall = assertDefined(spy.mock.calls.at(-1), "Expected spy to have been called");
        expect(lastCall[0].schema).toStrictEqual(
          model_surfaces_schemas.attribute.polygon.attribute,
        );
        expect(lastCall[0].params).toStrictEqual(
          expect.objectContaining({
            id,
            block_ids: surface_viewer_ids,
            name: "test_attribute",
            item: 0,
            minimum: MINIMUM_RANGE,
            maximum: MAXIMUM_RANGE,
          }),
        );
        expect(viewerStore.status).toBe(Status.CONNECTED);
      },
      TEST_TIMEOUT_MS,
    );

    test(
      "stored configs 1 - select attribute triangle_vertices and item 2",
      async () => {
        const dataStyleStore = useDataStyleStore();
        const dataStore = useDataStore();
        const surfaceIds = assertNonEmpty(await dataStore.getSurfacesGeodeIds(id));
        const surface_id = firstElement(surfaceIds);
        await dataStyleStore.setModelSurfacesPolygonAttributeName(
          id,
          surfaceIds,
          "triangle_vertices",
        );
        await dataStyleStore.setModelSurfacesPolygonAttributeItem(id, surfaceIds, 2);
        expect(dataStyleStore.modelSurfacesPolygonAttributeName(id, surface_id)).toBe(
          "triangle_vertices",
        );
        expect(dataStyleStore.modelSurfacesPolygonAttributeItem(id, surface_id)).toBe(2);
      },
      TEST_TIMEOUT_MS,
    );

    test(
      "stored configs 2 - set range and colormap",
      async () => {
        const dataStyleStore = useDataStyleStore();
        const dataStore = useDataStore();
        const surfaceIds = assertNonEmpty(await dataStore.getSurfacesGeodeIds(id));
        const surface_id = firstElement(surfaceIds);
        await dataStyleStore.setModelSurfacesPolygonAttributeRange(
          id,
          surfaceIds,
          MINIMUM_RANGE,
          MAXIMUM_RANGE,
        );
        await dataStyleStore.setModelSurfacesPolygonAttributeColorMap(id, surfaceIds, "budaS");
        await sleep(SLEEP_MS);
        expect(dataStyleStore.modelSurfacesPolygonAttributeRange(id, surface_id)).toStrictEqual([
          MINIMUM_RANGE,
          MAXIMUM_RANGE,
        ]);
        expect(dataStyleStore.modelSurfacesPolygonAttributeColorMap(id, surface_id)).toBe("budaS");
      },
      TEST_TIMEOUT_MS,
    );

    test(
      "stored configs 3 - select triangle_adjacents",
      async () => {
        const dataStyleStore = useDataStyleStore();
        const dataStore = useDataStore();
        const surfaceIds = assertNonEmpty(await dataStore.getSurfacesGeodeIds(id));
        const surface_id = firstElement(surfaceIds);
        await dataStyleStore.setModelSurfacesPolygonAttributeName(
          id,
          surfaceIds,
          "triangle_adjacents",
        );
        await dataStyleStore.setModelSurfacesPolygonAttributeItem(id, surfaceIds, 0);
        expect(dataStyleStore.modelSurfacesPolygonAttributeName(id, surface_id)).toBe(
          "triangle_adjacents",
        );
        expect(dataStyleStore.modelSurfacesPolygonAttributeItem(id, surface_id)).toBe(0);
      },
      TEST_TIMEOUT_MS,
    );

    test(
      "stored configs 4 - switch back to triangle_vertices and verify restoration",
      async () => {
        const dataStyleStore = useDataStyleStore();
        const dataStore = useDataStore();
        const surfaceIds = assertNonEmpty(await dataStore.getSurfacesGeodeIds(id));
        const surface_id = firstElement(surfaceIds);
        await dataStyleStore.setModelSurfacesPolygonAttributeName(
          id,
          surfaceIds,
          "triangle_vertices",
        );
        expect(dataStyleStore.modelSurfacesPolygonAttributeName(id, surface_id)).toBe(
          "triangle_vertices",
        );
        expect(dataStyleStore.modelSurfacesPolygonAttributeItem(id, surface_id)).toBe(2);
        expect(dataStyleStore.modelSurfacesPolygonAttributeRange(id, surface_id)).toStrictEqual([
          MINIMUM_RANGE,
          MAXIMUM_RANGE,
        ]);
        expect(dataStyleStore.modelSurfacesPolygonAttributeColorMap(id, surface_id)).toBe("budaS");
      },
      TEST_TIMEOUT_MS,
    );
  });

  describe("surfaces style", () => {
    test(
      "surfaces apply style",
      async () => {
        const dataStyleStore = useDataStyleStore();
        const viewerStore = useViewerStore();
        const result = dataStyleStore.applyModelSurfacesStyle(id);
        expect(result).toBeInstanceOf(Promise);
        await result;
        expect(viewerStore.status).toBe(Status.CONNECTED);
      },
      TEST_TIMEOUT_MS,
    );
  });

  describe("surface component active coloring", () => {
    test(
      "coloring color",
      async () => {
        const dataStyleStore = useDataStyleStore();
        const viewerStore = useViewerStore();
        const dataStore = useDataStore();
        const surface_ids = await dataStore.getSurfacesGeodeIds(id);
        const surface_id = firstElement(surface_ids);
        const coloringName = "constant";
        const result = dataStyleStore.setModelComponentActiveColoring(id, surface_id, coloringName);
        expect(result).toBeInstanceOf(Promise);
        await result;
        expect(dataStyleStore.modelSurfaceActiveColoring(id, surface_id)).toBe(coloringName);
        expect(viewerStore.status).toBe(Status.CONNECTED);
      },
      TEST_TIMEOUT_MS,
    );

    test(
      "coloring vertex",
      async () => {
        const dataStyleStore = useDataStyleStore();
        const viewerStore = useViewerStore();
        const dataStore = useDataStore();
        const surface_ids = await dataStore.getSurfacesGeodeIds(id);
        const surface_id = firstElement(surface_ids);
        await dataStyleStore.setModelSurfacesVertexAttributeName(id, [surface_id], "points");
        const coloringName = "vertex";
        const result = dataStyleStore.setModelComponentActiveColoring(id, surface_id, coloringName);
        expect(result).toBeInstanceOf(Promise);
        await result;
        expect(dataStyleStore.modelSurfaceActiveColoring(id, surface_id)).toBe(coloringName);
        expect(viewerStore.status).toBe(Status.CONNECTED);
      },
      TEST_TIMEOUT_MS,
    );

    test(
      "coloring polygon",
      async () => {
        const dataStyleStore = useDataStyleStore();
        const viewerStore = useViewerStore();
        const dataStore = useDataStore();
        const surface_ids = await dataStore.getSurfacesGeodeIds(id);
        const surface_id = firstElement(surface_ids);
        await dataStyleStore.setModelSurfacesPolygonAttributeName(
          id,
          [surface_id],
          "test_attribute",
        );
        const coloringName = "polygon";
        const result = dataStyleStore.setModelComponentActiveColoring(id, surface_id, coloringName);
        expect(result).toBeInstanceOf(Promise);
        await result;
        expect(dataStyleStore.modelSurfaceActiveColoring(id, surface_id)).toBe(coloringName);
        expect(viewerStore.status).toBe(Status.CONNECTED);
      },
      TEST_TIMEOUT_MS,
    );
  });
});
