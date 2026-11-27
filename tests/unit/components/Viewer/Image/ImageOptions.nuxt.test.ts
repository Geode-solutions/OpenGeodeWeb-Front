// oxlint-disable vitest/require-mock-type-parameters
import { type VueWrapper, flushPromises } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";
import { mockAs, setupActivePinia, vuetify } from "@ogw_tests/utils";
import ImageOptions from "@ogw_front/components/Viewer/Image/ImageOptions.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

vi.setConfig({ testTimeout: 10_000 });

const IMAGE_ID = "image";
const OPACITY = 0.6;
const NEW_OPACITY = 0.25;

// The circular item only shows its options once opened: the stub always shows them
const MENU_ITEM_STUB = { template: "<div><slot name='options' /></div>" };

async function mountOptions(visibility: boolean): Promise<VueWrapper> {
  const pinia = setupActivePinia();
  const dataStyleStore = useDataStyleStore();
  dataStyleStore.imageVisibility = mockAs<typeof dataStyleStore.imageVisibility>(() => visibility);
  dataStyleStore.imageOpacity = mockAs<typeof dataStyleStore.imageOpacity>(() => OPACITY);
  dataStyleStore.setImageVisibility = mockAs<typeof dataStyleStore.setImageVisibility>(
    vi.fn().mockResolvedValue(undefined),
  );
  dataStyleStore.setImageOpacity = mockAs<typeof dataStyleStore.setImageOpacity>(
    vi.fn().mockResolvedValue(undefined),
  );
  const hybridViewerStore = useHybridViewerStore();
  hybridViewerStore.remoteRender = mockAs<typeof hybridViewerStore.remoteRender>(
    vi.fn().mockResolvedValue(undefined),
  );
  const wrapper = await mountSuspended(ImageOptions, {
    props: { dataId: IMAGE_ID, index: 0 },
    global: { plugins: [vuetify, pinia], stubs: { ViewerContextMenuItem: MENU_ITEM_STUB } },
  });
  return wrapper;
}

describe("image options", () => {
  test("shows the visibility and the opacity of the image", async () => {
    const wrapper = await mountOptions(true);
    expect(wrapper.getComponent({ name: "VSwitch" }).props("modelValue")).toBe(true);
    expect(wrapper.getComponent({ name: "VSlider" }).props("modelValue")).toBe(OPACITY);
  });

  test("hides the opacity of a hidden image", async () => {
    const wrapper = await mountOptions(false);
    expect(wrapper.findComponent({ name: "VSlider" }).exists()).toBe(false);
  });

  test("changes the visibility of the image", async () => {
    const wrapper = await mountOptions(true);
    await wrapper.getComponent({ name: "VSwitch" }).setValue(false);
    await flushPromises();
    expect(useDataStyleStore().setImageVisibility).toHaveBeenCalledWith(IMAGE_ID, false);
    expect(useHybridViewerStore().remoteRender).toHaveBeenCalledWith();
  });

  test("changes the opacity of the image", async () => {
    const wrapper = await mountOptions(true);
    await wrapper.getComponent({ name: "VSlider" }).setValue(NEW_OPACITY);
    await flushPromises();
    expect(useDataStyleStore().setImageOpacity).toHaveBeenCalledWith(IMAGE_ID, NEW_OPACITY);
    expect(useHybridViewerStore().remoteRender).toHaveBeenCalledWith();
  });
});
