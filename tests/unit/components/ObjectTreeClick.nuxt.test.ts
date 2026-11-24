// Third party imports
import { describe, expect, test, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";

// Local imports
import { setupActivePinia, vuetify } from "@ogw_tests/utils";
import CommonTreeView from "@ogw_front/components/Viewer/ObjectTree/Base/CommonTreeView.vue";

vi.setConfig({ testTimeout: 10_000 });

const items = [
  { id: "mesh1", title: "Mesh 1" },
  { id: "mesh2", title: "Mesh 2" },
];

describe("object tree row click", () => {
  const pinia = setupActivePinia();

  test.each([
    { name: "a hidden item", selected: [] },
    { name: "a visible item", selected: ["mesh2"] },
  ])("clicking $name activates it without changing its visibility", async ({ selected }) => {
    const wrapper = await mountSuspended(CommonTreeView, {
      global: { plugins: [vuetify, pinia] },
      props: { items, selected },
    });
    const rows = wrapper.findAll("[data-testid='treeRowWrapper']");
    expect(rows).toHaveLength(items.length);

    await rows[1]?.trigger("click");

    expect(wrapper.emitted("update:active")?.at(-1)).toStrictEqual([["mesh2"]]);
    expect(wrapper.emitted("update:selected")).toBeUndefined();
  });
});
