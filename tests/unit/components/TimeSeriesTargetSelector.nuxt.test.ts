// oxlint-disable vitest/require-mock-type-parameters
// Third party imports
import { describe, expect, test, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";

// Local imports
import { mockAs, setupActivePinia, vuetify } from "@ogw_tests/utils";
import TimeSeriesTargetSelector from "@ogw_front/components/TimeSeriesTargetSelector.vue";
import { useBackStore } from "@ogw_front/stores/back";
import { useDataStore } from "@ogw_front/stores/data";

describe("time series target selector", () => {
  const pinia = setupActivePinia();
  const backStore = useBackStore();
  backStore.request = mockAs<typeof backStore.request>(
    vi.fn().mockResolvedValue({ allowed_objects: ["BRep"] }),
  );

  test("lists compatible models and emits the selected one", async () => {
    const dataStore = useDataStore(pinia);
    dataStore.allItems = mockAs<typeof dataStore.allItems>(
      vi.fn().mockResolvedValue([
        { id: "brep_id", name: "cube", geode_object_type: "BRep" },
        { id: "points_id", name: "points", geode_object_type: "PointSet3D" },
      ]),
    );
    const wrapper = await mountSuspended(TimeSeriesTargetSelector, {
      global: { plugins: [vuetify, pinia] },
      props: { filename: "time_series.pvd" },
    });
    await flushPromises();

    const items = wrapper.findAll("[data-testid='timeSeriesTarget']");
    expect(items).toHaveLength(1);
    await items[0]?.trigger("click");

    expect(wrapper.emitted("update_values")?.[0]).toStrictEqual([
      { target_id: "brep_id", geode_object_type: "BRep" },
    ]);
    expect(wrapper.emitted("increment_step")).toBeDefined();
  });

  test("warns when no compatible model is loaded", async () => {
    const dataStore = useDataStore(pinia);
    dataStore.allItems = mockAs<typeof dataStore.allItems>(vi.fn().mockResolvedValue([]));
    const wrapper = await mountSuspended(TimeSeriesTargetSelector, {
      global: { plugins: [vuetify, pinia] },
      props: { filename: "time_series.pvd" },
    });
    await flushPromises();

    expect(wrapper.find("[data-testid='noTimeSeriesTarget']").exists()).toBe(true);
  });
});
