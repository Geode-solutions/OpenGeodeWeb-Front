// oxlint-disable vitest/require-mock-type-parameters
import { type VueWrapper, flushPromises } from "@vue/test-utils";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { mockAs, setupActivePinia, vuetify } from "@ogw_tests/utils";
import GlobalObjects from "@ogw_front/components/Viewer/ObjectTree/Views/GlobalObjects.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { ref } from "vue";
import { useDataStore } from "@ogw_front/stores/data";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

vi.setConfig({ testTimeout: 10_000 });

const MODEL = { id: "a", title: "corbi", viewer_type: "model", geode_object_type: "BRep" };

// Renders the append slot of one model row and lets the test hover it
const TREE_STUB = {
  name: "CommonTreeView",
  props: ["items", "selected", "linked"],
  emits: ["hover:enter", "hover:leave"],
  setup(): { model: typeof MODEL } {
    return { model: MODEL };
  },
  template: `<div>
    <button data-testid='modelRow'
      @mouseenter="$emit('hover:enter', { item: model })"
      @mouseleave="$emit('hover:leave', { item: model })" />
    <slot name="append" :item="model" />
  </div>`,
};

async function mountObjects(): Promise<VueWrapper> {
  const pinia = setupActivePinia();
  const dataStore = useDataStore();
  dataStore.refCrsItems = mockAs<typeof dataStore.refCrsItems>(() => ref([]));
  const treeviewStore = useTreeviewStore();
  treeviewStore.addItem("BRep", "corbi", "a", "geode-a", "model");
  const wrapper = await mountSuspended(GlobalObjects, {
    global: {
      plugins: [vuetify, pinia],
      stubs: { CommonTreeView: TREE_STUB, ObjectTreeControls: true },
    },
  });
  return wrapper;
}

function expandButtonColor(wrapper: VueWrapper): unknown {
  const button = wrapper
    .findAllComponents({ name: "VBtn" })
    .find((btn) => btn.attributes("data-testid") === "expandModelComponentsButton");
  return button?.props("color");
}

describe("model tree link in the objects tree", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("the expand button takes the color of the opened model tree", async () => {
    const wrapper = await mountObjects();
    expect(expandButtonColor(wrapper)).toBeUndefined();
    const treeviewStore = useTreeviewStore();
    treeviewStore.displayAdditionalTree("a", "corbi", "BRep");
    await flushPromises();
    const color = treeviewStore.opened_views.find((view) => view.id === "a")?.color;
    expect(color).toBeDefined();
    expect(expandButtonColor(wrapper)).toBe(color);
  });

});
