// Third party imports
import { describe, expect, test } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { nextTick } from "vue";

// Local imports
import { setupActivePinia, vuetify } from "@ogw_tests/utils";
import Controls from "@ogw_front/components/Viewer/ObjectTree/Base/Controls.vue";

const props = {
  search: "",
  sortType: "name" as const,
  filterOptions: {},
  availableFilterOptions: [],
  isCollapsed: false,
};

async function openSearch(): Promise<VueWrapper> {
  const wrapper = await mountSuspended(Controls, {
    global: { plugins: [vuetify, setupActivePinia()] },
    props,
    attachTo: document.body,
  });
  await wrapper.find('[data-testid="searchObjectsButton"]').trigger("click");
  await nextTick();
  await nextTick();
  return wrapper;
}

describe("object tree toolbar search", () => {
  test("the search field takes the focus as it shows", async () => {
    const wrapper = await openSearch();
    const input = wrapper.find('[data-testid="searchObjectsInput"] input');
    expect(document.activeElement).toBe(input.element);
    wrapper.unmount();
  });

  test("leaving the toolbar folds an empty search back", async () => {
    const wrapper = await openSearch();
    await wrapper.find(".controls-capsule").trigger("focusout", { relatedTarget: document.body });
    expect(wrapper.find(".controls-capsule").classes()).not.toContain("is-expanded");
    wrapper.unmount();
  });

  test("leaving the toolbar keeps a search in progress shown", async () => {
    const wrapper = await openSearch();
    await wrapper.setProps({ search: "corner" });
    await wrapper.find(".controls-capsule").trigger("focusout", { relatedTarget: document.body });
    expect(wrapper.find(".controls-capsule").classes()).toContain("is-expanded");
    wrapper.unmount();
  });
});
