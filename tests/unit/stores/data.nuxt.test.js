// Third party imports
import { beforeEach, describe, expect, test } from "vitest";

// Local imports
import { setupActivePinia } from "@ogw_tests/utils";
import { useDataStore } from "@ogw_front/stores/data";

describe("useDataStore - collections", () => {
  setupActivePinia();

  beforeEach(async () => {
    const dataStore = useDataStore();
    await dataStore.clear();
  });

  test("correctly recognizes, formats, and pluralizes any collection component type not in MESH_COMPONENT_TYPES", async () => {
    const dataStore = useDataStore();
    const modelId = "test_model_id";

    // 1. Add model item
    await dataStore.addItem({
      id: modelId,
      name: "Test Model",
      viewer_type: "model",
    });

    // 2. Add mesh components and collection components (including a custom type like "MyCustomCollection")
    await dataStore.addComponents({
      id: modelId,
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
      collection_components: [
        { geode_id: "fault1", items: ["mesh_surface"] },
        { geode_id: "custom1", items: [] },
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
        title: "Custom 1",
        category: "MyCustomCollection",
        viewer_id: 4,
        is_active: true,
      },
      { id: "fault1", title: "Fault 1", category: "Fault", viewer_id: 3, is_active: true },
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
            title: "Fault 1",
            category: "Fault",
            viewer_id: 3,
            is_active: true,
            children: [
              {
                id: "mesh_surface",
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
