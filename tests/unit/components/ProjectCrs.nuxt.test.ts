// Third party imports
import { describe, expect, test, vi } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { ref } from "vue";

// Local imports
import { mockAs, setupActivePinia, vuetify } from "@ogw_tests/utils";
import ProjectCrs from "@ogw_front/components/ProjectCrs.vue";
import { useCrsStore } from "@ogw_front/stores/crs";
import { useDataStore } from "@ogw_front/stores/data";

const LAMBERT = { authority: "EPSG", code: "2154", name: "RGF93 v1 / Lambert-93" };
const WIDGET = '[data-testid="projectCrs"]';

vi.setConfig({ testTimeout: 10_000 });

async function mountWidget(
  setup: (store: ReturnType<typeof useCrsStore>) => void,
): Promise<VueWrapper> {
  const pinia = setupActivePinia();
  const dataStore = useDataStore();
  dataStore.refCrsItems = mockAs<typeof dataStore.refCrsItems>(() => ref([]));
  setup(useCrsStore());
  const wrapper = await mountSuspended(ProjectCrs, { global: { plugins: [vuetify, pinia] } });
  return wrapper;
}

describe("project crs widget", () => {
  test("shows no crs before the first georeferenced data", async () => {
    const wrapper = await mountWidget(() => {
      // No data: no project CRS
    });
    expect(wrapper.get(WIDGET).text()).toContain("No CRS");
  });

  test("shows the project crs and asks for its edit", async () => {
    const wrapper = await mountWidget((store) => {
      store.enableCrsEdit();
      store.setProjectCrs(LAMBERT);
    });
    expect(wrapper.get(WIDGET).text()).toContain("CRS: EPSG:2154 · RGF93 v1 / Lambert-93");
    await wrapper.get(WIDGET).trigger("click");
    expect(useCrsStore().projectCrsEditRequest).toBe(true);
  });

  test("cannot be edited when no app hosts the dialog", async () => {
    const wrapper = await mountWidget((store) => {
      store.setProjectCrs(LAMBERT);
    });
    expect(wrapper.get(WIDGET).attributes("disabled")).toBeDefined();
  });
});
