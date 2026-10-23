// Third party imports
import { describe, expect, test, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";

// Local imports
import { mockAs, setupActivePinia, vuetify } from "@ogw_tests/utils";
import type { DisplayItem } from "@ogw_front/composables/virtual_tree";
import ItemLabel from "@ogw_front/components/Viewer/ObjectTree/Base/ItemLabel.vue";
import { ref } from "vue";
import { useCrsStore } from "@ogw_front/stores/crs";
import { useDataStore } from "@ogw_front/stores/data";

vi.setConfig({ testTimeout: 10_000 });

const DATA_ID_LENGTH = 32;
const DATA_ID = "a".repeat(DATA_ID_LENGTH);
const GEODE_ID = "01a08187-2c4c-7e64-85c5-52c3439f0626";

function leaf(raw: Record<string, unknown>): DisplayItem {
  return { raw, id: raw.id, depth: 0, isOpen: false, isActive: false, isLeaf: true };
}

const VTooltipStub = {
  template: '<div><slot name="activator" :props="{}" /><slot /></div>',
};

// The stored item is only read once the tooltip opens
const OpenTooltipStub = {
  emits: ["update:modelValue"],
  mounted(this: { $emit: (event: "update:modelValue", value: boolean) => void }): void {
    this.$emit("update:modelValue", true);
  },
  template: VTooltipStub.template,
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

  test("shows the crs and asks for an edit when enabled", async () => {
    const LAMBERT = { authority: "EPSG", code: "2154", name: "RGF93 v1 / Lambert-93" };
    const dataStore = useDataStore();
    dataStore.refItem = mockAs<typeof dataStore.refItem>(
      vi.fn<() => unknown>().mockReturnValue(ref({ id: DATA_ID, crs: LAMBERT })),
    );
    const crsStore = useCrsStore();
    crsStore.enableCrsEdit();
    const wrapper = await mountSuspended(ItemLabel, {
      global: { plugins: [vuetify, pinia], stubs: { VTooltip: OpenTooltipStub } },
      props: {
        item: leaf({ id: DATA_ID, geode_id: GEODE_ID, title: "cube" }),
        isLeaf: true,
        showCrs: true,
      },
    });
    expect(wrapper.get('[data-testid="tooltipCrsValue"]').text()).toContain("EPSG:2154");
    await wrapper.get('[data-testid="editCrsBtn"]').trigger("click");
    expect(crsStore.crsEditRequest).toBe(DATA_ID);
  });

  test("does not read the stored item while the tooltip is closed", async () => {
    const dataStore = useDataStore();
    const refItem = vi.fn<() => unknown>().mockReturnValue(ref({ id: DATA_ID }));
    dataStore.refItem = mockAs<typeof dataStore.refItem>(refItem);
    await mountSuspended(ItemLabel, {
      global: { plugins: [vuetify, pinia], stubs: { VTooltip: VTooltipStub } },
      props: {
        item: leaf({ id: DATA_ID, geode_id: GEODE_ID, title: "cube" }),
        isLeaf: true,
        showCrs: true,
      },
    });
    expect(refItem).not.toHaveBeenCalled();
  });

  test("has no crs row without showCrs", async () => {
    const wrapper = await mountSuspended(ItemLabel, {
      global: { plugins: [vuetify, pinia], stubs: { VTooltip: VTooltipStub } },
      props: { item: leaf({ id: DATA_ID, geode_id: GEODE_ID, title: "cube" }), isLeaf: true },
    });
    expect(wrapper.find('[data-testid="tooltipCrsValue"]').exists()).toBe(false);
  });

  test("follows the item when the row is reused for another data", async () => {
    const LAMBERT = { authority: "EPSG", code: "2154", name: "RGF93 v1 / Lambert-93" };
    const OTHER_ID = "b".repeat(DATA_ID_LENGTH);
    const items: Record<string, unknown> = {
      [DATA_ID]: { id: DATA_ID },
      [OTHER_ID]: { id: OTHER_ID, crs: LAMBERT },
    };
    const dataStore = useDataStore();
    dataStore.refItem = mockAs<typeof dataStore.refItem>(
      vi.fn<(id: string) => unknown>().mockImplementation((id) => ref(items[id])),
    );
    const wrapper = await mountSuspended(ItemLabel, {
      global: { plugins: [vuetify, pinia], stubs: { VTooltip: OpenTooltipStub } },
      props: { item: leaf({ id: DATA_ID, title: "group" }), isLeaf: false, showCrs: false },
    });
    // The virtual tree reuses this label for another row
    await wrapper.setProps({
      item: leaf({ id: OTHER_ID, geode_id: GEODE_ID, title: "points" }),
      isLeaf: true,
      showCrs: true,
    });
    expect(wrapper.get('[data-testid="tooltipCrsValue"]').text()).toContain("EPSG:2154");
  });
});
