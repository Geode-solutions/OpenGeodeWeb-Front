// Third party imports
import { describe, expect, test } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";

// Local imports
import { setupActivePinia, vuetify } from "@ogw_tests/utils";
import type { DisplayItem } from "@ogw_front/composables/virtual_tree";
import ItemLabel from "@ogw_front/components/Viewer/ObjectTree/Base/ItemLabel.vue";

const DATA_ID_LENGTH = 32;
const DATA_ID = "a".repeat(DATA_ID_LENGTH);
const GEODE_ID = "01a08187-2c4c-7e64-85c5-52c3439f0626";

function leaf(raw: Record<string, unknown>): DisplayItem {
  return { raw, id: raw.id, depth: 0, isOpen: false, isActive: false, isLeaf: true };
}

const VTooltipStub = {
  template: '<div><slot name="activator" :props="{}" /><slot /></div>',
};

describe("item label tooltip", () => {
  const pinia = setupActivePinia();

  test("shows the geode id, not the data id", async () => {
    const wrapper = await mountSuspended(ItemLabel, {
      global: { plugins: [vuetify, pinia], stubs: { VTooltip: VTooltipStub } },
      props: { item: leaf({ id: DATA_ID, geode_id: GEODE_ID, title: "cube" }), isLeaf: true },
    });
    expect(wrapper.get('[data-testid="tooltipIdValue"]').text()).toBe(GEODE_ID);
    expect(wrapper.find(`[data-testid="treeRow-${DATA_ID}"]`).exists()).toBe(true);
  });

  test("a group node has no ID row", async () => {
    const wrapper = await mountSuspended(ItemLabel, {
      global: { plugins: [vuetify, pinia], stubs: { VTooltip: VTooltipStub } },
      props: {
        item: leaf({ id: "EdgedCurve3D", title: "EdgedCurve3D", children: [] }),
        isLeaf: true,
      },
    });
    expect(wrapper.find('[data-testid="tooltipIdValue"]').exists()).toBe(false);
  });
});
