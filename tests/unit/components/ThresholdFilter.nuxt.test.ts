// Third party imports
import { describe, expect, test, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";

// Local imports
import ThresholdFilter from "@ogw_front/components/ThresholdFilter.vue";
import { vuetify } from "@ogw_tests/utils";

const DEBOUNCE_WAIT = 200;
const LAST_STEP = 2;
const timeStep = ref<number | undefined>(0);
const setThreshold = vi.fn<(ids: string[], threshold?: { name: string }) => void>();

vi.mock(import("@ogw_front/stores/back") as Promise<unknown>, () => ({
  useBackStore: (): { request: () => Promise<unknown> } => ({
    request: vi.fn<() => Promise<unknown>>().mockResolvedValue({
      attributes: [
        {
          attribute_name: "temp",
          nb_items: 1,
          min_value: 0,
          max_value: 1,
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
vi.mock(import("@ogw_front/stores/hybrid_viewer") as Promise<unknown>, () => ({
  useHybridViewerStore: (): { setThreshold: typeof setThreshold } => ({ setThreshold }),
}));

async function settle(): Promise<void> {
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
    state.selectedSourceIndex = 0;
    await flushPromises();
    state.attributeName = "temp";
    await settle();
    expect(setThreshold).toHaveBeenLastCalledWith(
      ["id"],
      expect.objectContaining({ name: "temp@0" }),
    );

    timeStep.value = LAST_STEP;
    await settle();

    expect(setThreshold).toHaveBeenLastCalledWith(
      ["id"],
      expect.objectContaining({ name: "temp@2" }),
    );
  });
});
