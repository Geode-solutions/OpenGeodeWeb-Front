import { describe, expect, test, vi } from "vitest";
import { setupActivePinia, vuetify } from "@ogw_tests/utils";
import Box from "@ogw_front/components/Viewer/ObjectTree/Box.vue";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";

vi.setConfig({ testTimeout: 10_000 });

async function mountBox(props: Record<string, unknown>): Promise<VueWrapper> {
  const pinia = setupActivePinia();
  const wrapper = await mountSuspended(Box, {
    props: { title: "corbi", ...props },
    global: { plugins: [vuetify, pinia] },
  });
  return wrapper;
}

describe("model tree box", () => {
  test("shows its color stripe, highlighted on demand", async () => {
    const wrapper = await mountBox({ accent: { color: "#E53935", highlighted: false } });
    expect(wrapper.find('[data-testid="treeBoxAccent"]').exists()).toBe(true);
    expect(wrapper.classes()).not.toContain("is-highlighted");
    await wrapper.setProps({ accent: { color: "#E53935", highlighted: true } });
    expect(wrapper.classes()).toContain("is-highlighted");
  });

  test("has no stripe without an accent", async () => {
    const wrapper = await mountBox({});
    expect(wrapper.find('[data-testid="treeBoxAccent"]').exists()).toBe(false);
    expect(wrapper.classes()).not.toContain("is-highlighted");
  });

  test("reports header hover", async () => {
    const wrapper = await mountBox({});
    const header = wrapper.get(".tree-box-header");
    await header.trigger("mouseenter");
    await header.trigger("mouseleave");
    expect(wrapper.emitted("header-enter")).toHaveLength(1);
    expect(wrapper.emitted("header-leave")).toHaveLength(1);
  });
});
