// Third party imports
import { beforeEach, describe, expect, test } from "vitest";

// Local imports
import { type ModelComponentInput, useDataStore } from "@ogw_front/stores/data";
import { setupActivePinia } from "@ogw_tests/utils";

const DATA_ID_LENGTH = 32;

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
      id: dataId,
      geode_id: geodeId,
      name: "cube",
      viewer_type: "model",
      geode_object_type: "BRep",
    });
    const stored = await dataStore.item(dataId);
    expect(stored.geode_id).toBe(geodeId);
  });

  test("correctly recognizes, formats, and pluralizes any collection component type not in MESH_COMPONENT_TYPES", async () => {
    const dataStore = useDataStore();
    const modelId = "test_model_id";

    // 1. Add model item
    await dataStore.addItem({
      id: modelId,
      geode_id: "00000000-0000-0000-0000-000000000001",
      name: "Test Model",
      viewer_type: "model",
      geode_object_type: "BRep",
    });

    // 2. Add mesh components and collection components (including a custom type like "MyCustomCollection")
    await dataStore.addComponents({
      id: modelId,
      geode_id: "00000000-0000-0000-0000-000000000001",
      viewer_type: "model",
      geode_object_type: "BRep",
      mesh_components: [
        {
          geode_id: "mesh_corner",
          name: "Corner 1",
          type: "Corner",
          viewer_id: 1,
          is_active: true,
        },
        {
          geode_id: "mesh_surface",
          name: "Surface 1",
          type: "Surface",
          viewer_id: 2,
          is_active: true,
        },
      ],
      collection_components: [
        // Standard collection type
        { geode_id: "fault1", name: "Fault 1", type: "Fault", viewer_id: 3, is_active: true },
        // Custom collection type (not previously hardcoded)
        {
          geode_id: "custom1",
          name: "Custom 1",
          type: "MyCustomCollection",
          viewer_id: 4,
          is_active: true,
        },
      ],
    });

    // Add component relations
    await dataStore.addComponentRelations({
      id: modelId,
      geode_id: "00000000-0000-0000-0000-000000000001",
      viewer_type: "model",
      geode_object_type: "BRep",
      collection_components: [
        {
          geode_id: "fault1",
          name: "Fault 1",
          type: "Fault",
          viewer_id: 3,
          is_active: true,
          items: ["mesh_surface"],
        },
        {
          geode_id: "custom1",
          name: "Custom 1",
          type: "MyCustomCollection",
          viewer_id: 4,
          is_active: true,
          items: [],
        },
      ],
    });

    // 3. Verify hasCollectionComponents is true
    const hasCollections = await dataStore.hasCollectionComponents(modelId);
    expect(hasCollections).toBe(true);

    // 4. Verify getAllCollectionComponents returns both Fault and MyCustomCollection
    const allCollections = await dataStore.getAllCollectionComponents(modelId);
    expect(allCollections).toStrictEqual([
      {
        id: "custom1",
        geode_id: "custom1",
        title: "Custom 1",
        category: "MyCustomCollection",
        viewer_id: 4,
        is_active: true,
      },
      {
        id: "fault1",
        geode_id: "fault1",
        title: "Fault 1",
        category: "Fault",
        viewer_id: 3,
        is_active: true,
      },
    ]);

    // 5. Verify formatedCollectionComponents groups them and pluralizes the titles
    const formatted = await dataStore.formatedCollectionComponents(modelId);
    expect(formatted).toStrictEqual([
      {
        id: "MyCustomCollection",
        title: "MyCustomCollections",
        children: [
          {
            id: "custom1",
            geode_id: "custom1",
            title: "Custom 1",
            category: "MyCustomCollection",
            viewer_id: 4,
            is_active: true,
            children: [],
          },
        ],
      },
      {
        id: "Fault",
        title: "Faults",
        children: [
          {
            id: "fault1",
            geode_id: "fault1",
            title: "Fault 1",
            category: "Fault",
            viewer_id: 3,
            is_active: true,
            children: [
              {
                id: "mesh_surface",
                geode_id: "mesh_surface",
                title: "Surface 1",
                category: "Surface",
                viewer_id: 2,
                is_active: true,
              },
            ],
          },
        ],
      },
    ]);
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
      id: modelId,
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
      id: otherModelId,
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
        dataStore.isItemViewable({ id: "1", title: "BRep 1", geode_object_type: "BRep" }),
      ).toBe(true);

      // Group node for viewable type
      expect(dataStore.isItemViewable({ id: "BRep", title: "BRep" })).toBe(true);

      // HorizonStack3D leaf item
      expect(
        dataStore.isItemViewable({
          id: "2",
          title: "HS 1",
          geode_object_type: "HorizonStack3D",
        }),
      ).toBe(false);

      // HorizonStack3D group node
      expect(dataStore.isItemViewable({ id: "HorizonStack3D", title: "HorizonStack3D" })).toBe(
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
