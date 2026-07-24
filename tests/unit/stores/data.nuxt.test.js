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
        { geode_id: "mesh_corner", name: "Corner 1", type: "Corner", viewer_id: 1, is_active: true },
        { geode_id: "mesh_surface", name: "Surface 1", type: "Surface", viewer_id: 2, is_active: true },
      ],
      collection_components: [
        // Standard collection type
        { geode_id: "fault1", name: "Fault 1", type: "Fault", viewer_id: 3, is_active: true },
        // Custom collection type (not previously hardcoded)
        { geode_id: "custom1", name: "Custom 1", type: "MyCustomCollection", viewer_id: 4, is_active: true },
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
    expect(allCollections).toHaveLength(2);
    expect(allCollections).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "fault1", category: "Fault" }),
        expect.objectContaining({ id: "custom1", category: "MyCustomCollection" }),
      ]),
    );

    // 5. Verify formatedCollectionComponents groups them and pluralizes the titles
    const formatted = await dataStore.formatedCollectionComponents(modelId);
    expect(formatted).toHaveLength(2);

    const faultGroup = formatted.find((group) => group.id === "Fault");
    expect(faultGroup).toBeDefined();
    expect(faultGroup.title).toBe("Faults");
    expect(faultGroup.children).toHaveLength(1);
    expect(faultGroup.children[0].id).toBe("fault1");
    expect(faultGroup.children[0].children).toHaveLength(1);
    expect(faultGroup.children[0].children[0].id).toBe("mesh_surface");

    const customGroup = formatted.find((group) => group.id === "MyCustomCollection");
    expect(customGroup).toBeDefined();
    expect(customGroup.title).toBe("MyCustomCollections");
    expect(customGroup.children).toHaveLength(1);
    expect(customGroup.children[0].id).toBe("custom1");
    expect(customGroup.children[0].children).toHaveLength(0);
  });
});
