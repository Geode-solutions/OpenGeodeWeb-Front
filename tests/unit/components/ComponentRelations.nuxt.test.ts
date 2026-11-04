// Third party imports
import { beforeEach, describe, expect, test, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";

// Local imports
import { setupActivePinia, vuetify } from "@ogw_tests/utils";
import ComponentRelations from "@ogw_front/components/Viewer/ObjectTree/Base/ComponentRelations.vue";
import { useDataStore } from "@ogw_front/stores/data";

const MODEL_ID = "model";
const SURFACE_BOUNDARIES = ["line1", "line2", "line3", "line4"];
const SURFACE_INTERNALS = ["line5"];
const COMPONENTS = [
  ["surface", "Surface"],
  ["line1", "Line"],
  ["line2", "Line"],
  ["line3", "Line"],
  ["line4", "Line"],
  ["line5", "Line"],
  ["corner", "Corner"],
] as const;

describe("component relations", () => {
  const pinia = setupActivePinia();

  beforeEach(async () => {
    const dataStore = useDataStore();
    await dataStore.clear();
    const model = {
      id: MODEL_ID,
      geode_id: MODEL_ID,
      viewer_type: "model",
      geode_object_type: "Section",
      mesh_components: COMPONENTS.map(([geode_id, type], viewer_id) => ({
        geode_id,
        name: geode_id,
        type,
        viewer_id,
        is_active: true,
        boundaries: geode_id === "surface" ? SURFACE_BOUNDARIES : undefined,
        internals: geode_id === "surface" ? SURFACE_INTERNALS : undefined,
      })),
    };
    await dataStore.addComponents(model);
    await dataStore.addComponentRelations(model);
  });

  test("summarizes boundaries and internals by component type", async () => {
    const wrapper = await mountSuspended(ComponentRelations, {
      global: { plugins: [vuetify, pinia] },
      props: { modelId: MODEL_ID, componentId: "surface" },
    });
    await vi.waitFor(() => {
      expect(wrapper.find('[data-testid="relations-boundaries"]').exists()).toBe(true);
    });
    expect(wrapper.get('[data-testid="relations-boundaries"]').text()).toBe("4 Lines");
    expect(wrapper.get('[data-testid="relations-internals"]').text()).toBe("1 Line");
  });

  test("renders nothing for a component without relations", async () => {
    const dataStore = useDataStore();
    const getComponentRelations = vi.spyOn(dataStore, "getComponentRelations");
    const wrapper = await mountSuspended(ComponentRelations, {
      global: { plugins: [vuetify, pinia] },
      props: { modelId: MODEL_ID, componentId: "corner" },
    });
    await vi.waitFor(() => {
      expect(getComponentRelations).toHaveResolved();
    });
    await flushPromises();
    expect(wrapper.find('[data-testid="relations-boundaries"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="relations-internals"]').exists()).toBe(false);
  });
});
