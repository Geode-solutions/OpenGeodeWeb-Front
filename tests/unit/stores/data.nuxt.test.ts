// Third party imports
import { beforeEach, describe, expect, test, vi } from "vitest";

// Local imports
import { type ModelComponentInput, useDataStore } from "@ogw_front/stores/data";
import { setupActivePinia } from "@ogw_tests/utils";

const DATA_ID_LENGTH = 32;

vi.setConfig({ testTimeout: 10_000 });

function component(geode_id: string, type: string, viewer_id: number): ModelComponentInput {
  return { geode_id, name: geode_id, type, viewer_id, is_active: true };
}

describe("useDataStore - collections", () => {
  setupActivePinia();

  beforeEach(async () => {
    const dataStore = useDataStore();
    await dataStore.clear();
  });

  test("addItem stores geode_id", async () => {
    const dataStore = useDataStore();
    const dataId = "a".repeat(DATA_ID_LENGTH);
    const geodeId = "01a08187-2c4c-7e64-85c5-52c3439f0626";
    await dataStore.addItem({
      data_id: dataId,
      geode_id: geodeId,
      name: "cube",
      viewer_type: "model",
      geode_object_type: "BRep",
    });
    const stored = await dataStore.item(dataId);
    expect(stored.geode_id).toBe(geodeId);
  });

  test("addItem stores crs", async () => {
    const dataStore = useDataStore();
    const dataId = "b".repeat(DATA_ID_LENGTH);
    const crs = { authority: "EPSG", code: "2154", name: "RGF93 v1 / Lambert-93" };
    await dataStore.addItem({
      data_id: dataId,
      geode_id: "01a08187-2c4c-7e64-85c5-52c3439f0627",
      name: "points",
      viewer_type: "mesh",
      geode_object_type: "PointSet3D",
      crs,
    });
    const stored = await dataStore.item(dataId);
    expect(stored.crs).toStrictEqual(crs);
  });

  test("getComponentRelations returns the boundaries and internals of a component", async () => {
    const dataStore = useDataStore();
    const modelId = "test_model_id";
    const otherModelId = "other_model_id";
    const surface = {
      ...component("surface", "Surface", 1),
      boundaries: ["line1", "line2"],
      internals: ["corner"],
    };
    const line1 = { ...component("line1", "Line", 2), boundaries: ["corner"] };
    const model = {
      data_id: modelId,
      geode_id: modelId,
      viewer_type: "model",
      geode_object_type: "Section",
      mesh_components: [
        surface,
        line1,
        component("line2", "Line", 3),
        component("corner", "Corner", 4),
      ],
      collection_components: [{ ...component("fault", "Fault", 0), items: ["surface"] }],
    };
    await dataStore.addComponents(model);
    await dataStore.addComponentRelations(model);
    const otherModel = {
      ...model,
      data_id: otherModelId,
      mesh_components: [{ ...surface, boundaries: ["line2"], internals: [] }],
    };
    await dataStore.addComponents(otherModel);
    await dataStore.addComponentRelations(otherModel);

    const relations = await dataStore.getComponentRelations(modelId, "surface");
    expect(relations.boundaries.map((boundary) => boundary.id).toSorted()).toStrictEqual([
      "line1",
      "line2",
    ]);
    expect(relations.internals).toStrictEqual([
      {
        id: "corner",
        geode_id: "corner",
        title: "corner",
        category: "Corner",
        viewer_id: 4,
        is_active: true,
      },
    ]);

    const faultRelations = await dataStore.getComponentRelations(modelId, "fault");
    expect(faultRelations).toStrictEqual({ boundaries: [], internals: [] });
  });

  describe("isItemViewable", () => {
    test("correctly identifies viewable and HorizonStack3D items", () => {
      const dataStore = useDataStore();

      // Standard viewable item (BRep)
      expect(
        dataStore.isItemViewable({ data_id: "1", title: "BRep 1", geode_object_type: "BRep" }),
      ).toBe(true);

      // Group node for viewable type
      expect(dataStore.isItemViewable({ data_id: "BRep", title: "BRep" })).toBe(true);

      // HorizonStack3D leaf item
      expect(
        dataStore.isItemViewable({
          data_id: "2",
          title: "HS 1",
          geode_object_type: "HorizonStack3D",
        }),
      ).toBe(false);

      // HorizonStack3D group node
      expect(dataStore.isItemViewable({ data_id: "HorizonStack3D", title: "HorizonStack3D" })).toBe(
        false,
      );
    });

    test("respects explicit is_viewable overrides", () => {
      const dataStore = useDataStore();

      expect(dataStore.isItemViewable({ is_viewable: false })).toBe(false);
      expect(dataStore.isItemViewable({ is_viewable: true })).toBe(true);
    });
  });
});
