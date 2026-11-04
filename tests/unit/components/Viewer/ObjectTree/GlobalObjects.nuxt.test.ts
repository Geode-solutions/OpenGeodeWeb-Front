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
  template: `<div>
    <button data-testid='planRow' @click="$emit('contextmenu', { event: $event, item: { id: 'basemap:plan' } })" />
    <button data-testid='routesEye' @click="$emit('update:selected', [...selected, 'basemap:routes'])" />
  </div>`,
};

async function mountTree(withCrs: boolean): Promise<VueWrapper> {
  const pinia = setupActivePinia();
  const dataStore = useDataStore();
  // A data in the project CRS: the basemap has something to lie under
  const items: { id: string; created_at: string; crs: typeof LAMBERT }[] = [];
  if (withCrs) {
    items.push({ id: "a", created_at: "1", crs: LAMBERT });
  }
  dataStore.refCrsItems = mockAs<typeof dataStore.refCrsItems>(() => ref(items));
  useCrsStore();
  // Calls through: without displayed data, a build only clears the basemap
  vi.spyOn(useBasemapStore(), "setMaps");
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

function treeSelection(wrapper: VueWrapper): string[] {
  return mockAs<string[]>(wrapper.getComponent({ name: "CommonTreeView" }).props("selected"));
}

describe("global objects basemap category", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("comes first once data is in the project crs", async () => {
    const wrapper = await mountTree(true);
    expect(treeItems(wrapper)[0]?.id).toBe("basemap");
    expect(treeSelection(wrapper)).toStrictEqual(["basemap:satellite"]);
    // The data selection, saved with the project, never holds the basemap rows
    expect(useTreeviewStore().selection).toStrictEqual([]);
  });

  test("is absent without data in a crs", async () => {
    const wrapper = await mountTree(false);
    expect(treeItems(wrapper).map(({ id }) => id)).not.toContain("basemap");
  });

  test("a map eye adds that map, never as a data visibility", async () => {
    const wrapper = await mountTree(true);
    const treeviewStore = useTreeviewStore();
    await wrapper.get('[data-testid="routesEye"]').trigger("click");
    await flushPromises();
    expect(useBasemapStore().setMaps).toHaveBeenCalledWith(["satellite", "routes"]);
    expect(treeSelection(wrapper)).toStrictEqual(["basemap:satellite", "basemap:routes"]);
    expect(treeviewStore.selection).toStrictEqual([]);
    expect(useDataStyleStore().setVisibility).not.toHaveBeenCalled();
  });

  test("right click on a map opens the basemap menu", async () => {
    const wrapper = await mountTree(true);
    await wrapper.get('[data-testid="planRow"]').trigger("click");
    expect(wrapper.emitted("show-menu")).toStrictEqual([
      [expect.objectContaining({ itemId: "basemap:plan", context_type: "basemap" })],
    ]);
  });
});
