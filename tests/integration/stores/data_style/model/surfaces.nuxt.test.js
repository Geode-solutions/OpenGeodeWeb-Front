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
const model_surfaces_schemas = viewer_schemas.opengeodeweb_viewer.model.surfaces;
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

describe("model surfaces", () => {
  beforeAll(async () => {
    ({ id, projectFolderPath } = await setupIntegrationTests(file_name, geode_object));
  }, beforeAllTimeout);

  afterAll(async () => {
    console.log("afterAll model surfaces kill", projectFolderPath);
    await cleanupBackend(projectFolderPath);
  });
  describe("surfaces visibility", () => {
    test("visibility true", async () => {
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
          response_function: expect.any(Function),
        },
      );
      for (const surface_id of surface_ids) {
        expect(dataStyleStore.modelSurfaceVisibility(id, surface_id)).toBe(visibility);
      }
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });

  describe("surfaces color", () => {
    test("color red", async () => {
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
          response_function: expect.any(Function),
        },
      );
      for (const surface_id of surface_ids) {
        expect(dataStyleStore.modelSurfaceColor(id, surface_id)).toStrictEqual(color);
      }
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });
  describe("surfaces vertex attribute", () => {
    test("coloring vertex attribute", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const dataStore = useDataStore();
      const surface_ids = await dataStore.getSurfacesGeodeIds(id);
      const surface_viewer_ids = await dataStore.getMeshComponentsViewerIds(id, surface_ids);
      const spy = vi.spyOn(viewerStore, "request");
      spy.mockClear();
      const result = dataStyleStore.setModelSurfacesVertexAttributeName(id, surface_ids, "points");
      expect(result).toBeInstanceOf(Promise);
      await result;
      await sleep(SLEEP_MS);
      expect(spy).toHaveBeenCalledWith(
        {
          schema: model_surfaces_schemas.attribute.vertex.name,
          params: {
            id,
            block_ids: surface_viewer_ids,
            name: "points",
          },
        },
        {
          response_function: expect.any(Function),
        },
      );
      for (const surface_id of surface_ids) {
        expect(dataStyleStore.modelSurfacesVertexAttributeName(id, surface_id)).toBe("points");
      }
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });

  describe("surfaces polygon attribute", () => {
    test("coloring polygon attribute", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const dataStore = useDataStore();
      const surface_ids = await dataStore.getSurfacesGeodeIds(id);
      const surface_viewer_ids = await dataStore.getMeshComponentsViewerIds(id, surface_ids);
      const spy = vi.spyOn(viewerStore, "request");
      spy.mockClear();
      const result = dataStyleStore.setModelSurfacesPolygonAttributeName(
        id,
        surface_ids,
        "test_attribute",
      );
      expect(result).toBeInstanceOf(Promise);
      await result;
      await sleep(SLEEP_MS);
      expect(spy).toHaveBeenCalledWith(
        {
          schema: model_surfaces_schemas.attribute.polygon.name,
          params: {
            id,
            block_ids: surface_viewer_ids,
            name: "test_attribute",
          },
        },
        {
          response_function: expect.any(Function),
        },
      );
      for (const surface_id of surface_ids) {
        expect(dataStyleStore.modelSurfacesPolygonAttributeName(id, surface_id)).toBe(
          "test_attribute",
        );
      }
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });

  describe("surfaces style", () => {
    test("surfaces apply style", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const result = dataStyleStore.applyModelSurfacesStyle(id);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });

  describe("surface component active coloring", () => {
    test("coloring color", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const dataStore = useDataStore();
      const surface_ids = await dataStore.getSurfacesGeodeIds(id);
      const [surface_id] = surface_ids;
      const coloringName = "constant";
      const result = dataStyleStore.setModelComponentActiveColoring(id, surface_id, coloringName);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(dataStyleStore.modelSurfaceActiveColoring(id, surface_id)).toBe(coloringName);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("coloring vertex", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const dataStore = useDataStore();
      const surface_ids = await dataStore.getSurfacesGeodeIds(id);
      const [surface_id] = surface_ids;
      await dataStyleStore.setModelSurfacesVertexAttributeName(id, [surface_id], "points");
      const coloringName = "vertex";
      const result = dataStyleStore.setModelComponentActiveColoring(id, surface_id, coloringName);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(dataStyleStore.modelSurfaceActiveColoring(id, surface_id)).toBe(coloringName);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });

    test("coloring polygon", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const dataStore = useDataStore();
      const surface_ids = await dataStore.getSurfacesGeodeIds(id);
      const [surface_id] = surface_ids;
      await dataStyleStore.setModelSurfacesPolygonAttributeName(id, [surface_id], "test_attribute");
      const coloringName = "polygon";
      const result = dataStyleStore.setModelComponentActiveColoring(id, surface_id, coloringName);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(dataStyleStore.modelSurfaceActiveColoring(id, surface_id)).toBe(coloringName);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });
});
