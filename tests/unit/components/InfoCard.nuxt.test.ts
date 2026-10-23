import { beforeEach, describe, expect, test, vi } from "vitest";
import { mockAs, setupActivePinia, vuetify } from "@ogw_tests/utils";
import InfoCard from "@ogw_front/components/Viewer/ContextMenu/InfoCard.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { ref } from "vue";
import { useCrsStore } from "@ogw_front/stores/crs";
import { useDataStore } from "@ogw_front/stores/data";

vi.setConfig({ testTimeout: 10_000 });

const LAMBERT = { authority: "EPSG", code: "2154", name: "RGF93 v1 / Lambert-93" };
const UTM = { authority: "EPSG", code: "32631", name: "WGS 84 / UTM zone 31N" };

describe("info card crs", () => {
  // oxlint-disable-next-line eslint/init-declarations -- assigned in beforeEach before any test runs
  let pinia: ReturnType<typeof setupActivePinia>;

  beforeEach(() => {
    pinia = setupActivePinia();
  });

  test("shows the data crs and asks for an edit", async () => {
    const crsStore = useCrsStore();
    crsStore.enableCrsEdit();
    const wrapper = await mountSuspended(InfoCard, {
      global: { plugins: [vuetify, pinia] },
      props: { show: true, metaData: { id: "data-1", name: "cube", crs: LAMBERT } },
    });
    // The card is narrow: the code alone, the full name is in the tooltip
    expect(wrapper.get('[data-testid="infoCrsValue"]').text()).toBe("EPSG:2154");
    await wrapper.get('[data-testid="infoEditCrsBtn"]').trigger("click");
    expect(crsStore.crsEditRequest).toBe("data-1");
  });

  test("hides the edit button when the host app cannot edit", async () => {
    const wrapper = await mountSuspended(InfoCard, {
      global: { plugins: [vuetify, pinia] },
      props: { show: true, metaData: { id: "data-2", name: "cube" } },
    });
    expect(wrapper.get('[data-testid="infoCrsValue"]').text()).toBe("None");
    expect(wrapper.find('[data-testid="infoEditCrsBtn"]').exists()).toBe(false);
  });

  test("has no crs row for a model component", async () => {
    const wrapper = await mountSuspended(InfoCard, {
      global: { plugins: [vuetify, pinia] },
      props: { show: true, metaData: { id: "comp-1", modelId: "model-1", name: "Block" } },
    });
    expect(wrapper.find('[data-testid="infoCrsValue"]').exists()).toBe(false);
  });

  test("shows the crs stored after an edit, not the one captured when the menu opened", async () => {
    const dataStore = useDataStore();
    dataStore.refItem = mockAs<typeof dataStore.refItem>(
      vi.fn<() => unknown>().mockReturnValue(ref({ id: "data-3", crs: UTM })),
    );
    const wrapper = await mountSuspended(InfoCard, {
      global: { plugins: [vuetify, pinia] },
      props: { show: true, metaData: { id: "data-3", name: "cube", crs: LAMBERT } },
    });
    expect(wrapper.get('[data-testid="infoCrsValue"]').text()).toBe("EPSG:32631");
  });
});
