// Third party imports
import { beforeEach, describe, expect, test, vi } from "vitest";

// Local imports
import { setupActivePinia } from "@ogw_tests/utils";
import { useDataStore } from "@ogw_front/stores/data";

vi.setConfig({ testTimeout: 10_000 });

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
      data_id: modelId,
      geode_id: "00000000-0000-0000-0000-000000000001",
      name: "Test Model",
      viewer_type: "model",
      geode_object_type: "BRep",
    });

    // 2. Add mesh components and collection components (including a custom type like "MyCustomCollection")
    await dataStore.addComponents({
      data_id: modelId,
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
      data_id: modelId,
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
});
