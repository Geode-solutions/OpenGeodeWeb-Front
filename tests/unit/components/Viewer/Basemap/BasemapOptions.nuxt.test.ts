// oxlint-disable vitest/require-mock-type-parameters
import { type Component, ref } from "vue";
import { type VueWrapper, flushPromises } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";
import { mockAs, setupActivePinia, vuetify } from "@ogw_tests/utils";
import AroundOptions from "@ogw_front/components/Viewer/Basemap/AroundOptions.vue";
import OpacityOptions from "@ogw_front/components/Viewer/Basemap/OpacityOptions.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { useBasemapStore } from "@ogw_front/stores/basemap";
import { useDataStore } from "@ogw_front/stores/data";

vi.setConfig({ testTimeout: 10_000 });

const TOPO_OPACITY = 0.4;
const TOPO_PERCENT = 40;
const NEW_PERCENT = 70;
const NEW_OPACITY = 0.7;

// The circular item only shows its options once opened: the stub always shows them
const MENU_ITEM_STUB = { template: "<div><slot name='options' /></div>" };

function itemProps(id: string): Record<string, unknown> {
  return {
    id,
    meta_data: {},
    tooltip_location: "right",
    tooltip_origin: "left",
    totalItems: 1,
    index: 0,
  };
}

async function mountOptions(component: Component, id: string): Promise<VueWrapper> {
  const pinia = setupActivePinia();
  const dataStore = useDataStore();
  dataStore.refCrsItems = mockAs<typeof dataStore.refCrsItems>(() => ref([]));
  const basemapStore = useBasemapStore();
  basemapStore.setOpacity = mockAs<typeof basemapStore.setOpacity>(
    vi.fn().mockResolvedValue(undefined),
  );
  basemapStore.setAround = mockAs<typeof basemapStore.setAround>(
    vi.fn().mockResolvedValue(undefined),
  );
  basemapStore.opacities = { satellite: 1, streets: 1, topo: TOPO_OPACITY };
  const wrapper = await mountSuspended(component, {
    props: { itemProps: itemProps(id) },
    global: { plugins: [vuetify, pinia], stubs: { ViewerContextMenuItem: MENU_ITEM_STUB } },
  });
  return wrapper;
}

describe("basemap context menus", () => {
  test("the opacity of a map follows its own value, in percent", async () => {
    const wrapper = await mountOptions(OpacityOptions, "basemap:topo");
    const slider = wrapper.getComponent({ name: "VSlider" });
    expect(slider.props("modelValue")).toBe(TOPO_PERCENT);
    await slider.setValue(NEW_PERCENT);
    await flushPromises();
    expect(useBasemapStore().setOpacity).toHaveBeenCalledWith("topo", NEW_OPACITY);
  });

  test("map around is set from the basemap category", async () => {
    const wrapper = await mountOptions(AroundOptions, "basemap");
    const around = wrapper.getComponent({ name: "VSwitch" });
    expect(around.props("modelValue")).toBe(true);
    await around.setValue(false);
    await flushPromises();
    expect(useBasemapStore().setAround).toHaveBeenCalledWith(false);
  });
});
