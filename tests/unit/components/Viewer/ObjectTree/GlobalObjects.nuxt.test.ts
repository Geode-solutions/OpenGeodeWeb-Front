// oxlint-disable vitest/require-mock-type-parameters
// oxlint-disable max-dependencies
import { type VueWrapper, flushPromises } from "@vue/test-utils";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { mockAs, setupActivePinia, vuetify } from "@ogw_tests/utils";
import GlobalObjects from "@ogw_front/components/Viewer/ObjectTree/Views/GlobalObjects.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { ref } from "vue";
import { useBasemapStore } from "@ogw_front/stores/basemap";
import { useCrsStore } from "@ogw_front/stores/crs";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

vi.setConfig({ testTimeout: 10_000 });

const LAMBERT = { authority: "EPSG", code: "2154", name: "RGF93 v1 / Lambert-93" };

// Exposes the items it gets and lets the test click rows
const TREE_STUB = {
  name: "CommonTreeView",
  props: ["items", "selected"],
  emits: ["update:selected", "contextmenu"],
  template:
    "<button data-testid='streetsRow' @click=\"$emit('contextmenu', { event: $event, item: { id: 'basemap:streets' } })\" />",
};

async function mountTree(withCrs: boolean): Promise<VueWrapper> {
  const pinia = setupActivePinia();
  const dataStore = useDataStore();
  dataStore.refAllItems = mockAs<typeof dataStore.refAllItems>(() => ref([]));
  if (withCrs) {
    useCrsStore().setProjectCrs(LAMBERT);
  }
  // Calls through: without displayed data, a build only clears the basemap
  vi.spyOn(useBasemapStore(), "setStyle");
  const dataStyleStore = useDataStyleStore();
  dataStyleStore.setVisibility = mockAs<typeof dataStyleStore.setVisibility>(
    vi.fn().mockResolvedValue(undefined),
  );
  const hybridViewerStore = useHybridViewerStore();
  hybridViewerStore.remoteRender = mockAs<typeof hybridViewerStore.remoteRender>(
    vi.fn().mockResolvedValue(undefined),
  );
  const wrapper = await mountSuspended(GlobalObjects, {
    global: {
      plugins: [vuetify, pinia],
      stubs: { CommonTreeView: TREE_STUB, ObjectTreeControls: true },
    },
  });
  return wrapper;
}

function treeItems(wrapper: VueWrapper): { id: string }[] {
  return mockAs<{ id: string }[]>(wrapper.getComponent({ name: "CommonTreeView" }).props("items"));
}

describe("global objects basemap category", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("comes first once the project has a crs", async () => {
    const wrapper = await mountTree(true);
    expect(treeItems(wrapper)[0]?.id).toBe("basemap");
    expect(useTreeviewStore().selection).toStrictEqual(["basemap:satellite"]);
  });

  test("is absent without project crs", async () => {
    const wrapper = await mountTree(false);
    expect(treeItems(wrapper).map(({ id }) => id)).not.toContain("basemap");
  });

  test("a map eye shows that map alone, never as a data visibility", async () => {
    await mountTree(true);
    const treeviewStore = useTreeviewStore();
    treeviewStore.selection = ["basemap:satellite", "basemap:topo"];
    await flushPromises();
    expect(useBasemapStore().setStyle).toHaveBeenCalledWith("topo");
    expect(treeviewStore.selection).toStrictEqual(["basemap:topo"]);
    expect(useDataStyleStore().setVisibility).not.toHaveBeenCalled();
  });

  test("right click on a map opens the basemap menu", async () => {
    const wrapper = await mountTree(true);
    await wrapper.get('[data-testid="streetsRow"]').trigger("click");
    expect(wrapper.emitted("show-menu")).toStrictEqual([
      [expect.objectContaining({ itemId: "basemap:streets", context_type: "basemap" })],
    ]);
  });
});
