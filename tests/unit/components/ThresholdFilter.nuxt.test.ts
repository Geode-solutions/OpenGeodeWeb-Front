// Third party imports
import { describe, expect, test, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";

// Local imports
import type { ThresholdAttribute } from "@ogw_internal/stores/hybrid_viewer/filters";
import ThresholdCard from "@ogw_front/components/ThresholdCard.vue";
import ThresholdFilter from "@ogw_front/components/ThresholdFilter.vue";
import { vuetify } from "@ogw_tests/utils";

const DEBOUNCE_WAIT = 200;
const LAST_STEP = 2;
const timeStep = ref<number | undefined>(0);
const setThreshold = vi.fn<(ids: string[], attributes: ThresholdAttribute[]) => Promise<void>>();

vi.mock(import("@ogw_front/stores/back") as Promise<unknown>, () => ({
  useBackStore: (): { request: () => Promise<unknown> } => ({
    request: vi.fn<() => Promise<unknown>>().mockResolvedValue({
      attributes: [
        {
          attribute_name: "temp",
          nb_items: 1,
          time_steps: [0, 1, 2],
        },
      ],
    }),
  }),
}));
vi.mock(import("@ogw_front/stores/data") as Promise<unknown>, () => ({
  useDataStore: (): Record<string, unknown> => ({
    refAllItems: (): Ref<unknown[]> => ref([]),
    item: vi.fn<() => Promise<unknown>>().mockResolvedValue({
      viewer_type: "mesh",
      geode_object_type: "TriangulatedSurface3D",
    }),
  }),
}));
vi.mock(import("@ogw_front/stores/data_style") as Promise<unknown>, () => ({
  useDataStyleStore: (): { attributeTimeStep: () => number | undefined } => ({
    attributeTimeStep: (): number | undefined => timeStep.value,
  }),
}));
vi.mock(import("@ogw_front/stores/hybrid_viewer") as Promise<unknown>, async () => {
  const { useHybridViewerFilters } = await import("@ogw_internal/stores/hybrid_viewer/filters");
  const filters = useHybridViewerFilters();
  return {
    useHybridViewerStore: (): typeof filters => ({
      ...filters,
      setThreshold,
    }),
  };
});

async function settle(): Promise<void> {
  // oxlint-disable-next-line promise/avoid-new
  await new Promise((resolve) => {
    setTimeout(resolve, DEBOUNCE_WAIT);
  });
  await flushPromises();
}

describe("thresholdFilter time steps", () => {
  test("applies the threshold again on the new array when the stored step changes", async () => {
    const wrapper = await mountSuspended(ThresholdFilter, {
      global: { plugins: [vuetify] },
      props: { show: true },
    });
    // oxlint-disable-next-line no-unsafe-type-assertion -- script setup refs are not typed on vm
    const state = wrapper.vm as unknown as Record<string, unknown>;
    state.selectedDatasetId = "id";
    await flushPromises();
    // oxlint-disable-next-line no-unsafe-type-assertion -- script setup refs are not typed on vm
    const cardState = wrapper.findComponent(ThresholdCard).vm as unknown as Record<string, unknown>;
    cardState.selectedSourceIndex = 0;
    await flushPromises();
    cardState.attributeName = "temp";
    await settle();
    expect(setThreshold).toHaveBeenLastCalledWith(
      ["id"],
      [expect.objectContaining({ name: "temp@0" })],
    );

    timeStep.value = LAST_STEP;
    await settle();

    expect(setThreshold).toHaveBeenLastCalledWith(
      ["id"],
      [expect.objectContaining({ name: "temp@2" })],
    );
  });

  test("restores the card state when the panel is reopened", async () => {
    const wrapper = await mountSuspended(ThresholdFilter, {
      global: { plugins: [vuetify] },
      props: { show: true },
    });
    // oxlint-disable-next-line no-unsafe-type-assertion -- script setup refs are not typed on vm
    const state = wrapper.vm as unknown as Record<string, unknown>;
    state.selectedDatasetId = "restored_id";
    await flushPromises();
    // oxlint-disable-next-line no-unsafe-type-assertion -- script setup refs are not typed on vm
    const cardState = wrapper.findComponent(ThresholdCard).vm as unknown as Record<string, unknown>;
    cardState.selectedSourceIndex = 0;
    await flushPromises();
    cardState.attributeName = "temp";
    await settle();

    await wrapper.setProps({ show: false });
    await wrapper.setProps({ show: true });
    await flushPromises();

    // oxlint-disable-next-line no-unsafe-type-assertion -- script setup refs are not typed on vm
    const restoredState = wrapper.findComponent(ThresholdCard).vm as unknown as Record<
      string,
      unknown
    >;
    expect(restoredState.selectedSourceIndex).toBe(0);
    expect(restoredState.attributeName).toBe("temp");
  });
});
