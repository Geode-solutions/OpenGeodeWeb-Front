// Third party imports
import { beforeEach, describe, expect, test, vi } from "vitest";

// Local imports
import type { PhysicalProperty } from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { setupActivePinia } from "@ogw_tests/utils";
import { useDataStore } from "@ogw_front/stores/data";

vi.setConfig({ testTimeout: 10_000 });

const MODEL_ID = "model";
const OTHER_MODEL_ID = "other_model";
const FAILING_MODEL_ID = "failing_model";
const POROSITY = 0.2;

const POROSITY_PROPERTY: PhysicalProperty = {
  name: "porosity",
  component_type: "Block",
  attribute_id: "porosity-id",
  attribute_name: "porosity",
  element_type: "polyhedron",
  nb_items: 1,
  components: [{ geode_id: "block", min_values: [POROSITY], max_values: [POROSITY] }],
};

type BackRequest = (request: {
  params: { id: string };
}) => Promise<{ physical_properties: PhysicalProperty[] }>;

vi.mock(import("@ogw_front/stores/back") as Promise<unknown>, () => ({
  useBackStore: (): { request: BackRequest } => ({
    request: async ({ params }): Promise<{ physical_properties: PhysicalProperty[] }> => {
      if (params.id === FAILING_MODEL_ID) {
        throw new Error("Not a model");
      }
      const response = await Promise.resolve({ physical_properties: [POROSITY_PROPERTY] });
      return response;
    },
  }),
}));

describe("useDataStore - physical properties", () => {
  setupActivePinia();

  beforeEach(async () => {
    await useDataStore().clear();
  });

  test("stores the physical properties of a model read from the back", async () => {
    const dataStore = useDataStore();
    await dataStore.addPhysicalProperties(MODEL_ID);
    await expect(dataStore.getPhysicalProperties(MODEL_ID)).resolves.toStrictEqual([
      { ...POROSITY_PROPERTY, data_id: MODEL_ID },
    ]);
  });

  test("a failed back request stores nothing", async () => {
    const dataStore = useDataStore();
    await dataStore.addPhysicalProperties(FAILING_MODEL_ID);
    await expect(dataStore.getPhysicalProperties(FAILING_MODEL_ID)).resolves.toStrictEqual([]);
  });

  test("deleting a model deletes its physical properties only", async () => {
    const dataStore = useDataStore();
    await dataStore.addPhysicalProperties(MODEL_ID);
    await dataStore.addPhysicalProperties(OTHER_MODEL_ID);
    await dataStore.deleteItem(MODEL_ID);
    await expect(dataStore.getPhysicalProperties(MODEL_ID)).resolves.toStrictEqual([]);
    await expect(dataStore.getPhysicalProperties(OTHER_MODEL_ID)).resolves.toHaveLength(1);
  });

  test("clearing the store clears the physical properties", async () => {
    const dataStore = useDataStore();
    await dataStore.addPhysicalProperties(MODEL_ID);
    await dataStore.clear();
    await expect(dataStore.getPhysicalProperties(MODEL_ID)).resolves.toStrictEqual([]);
  });
});
