// Only ever fires now that tests are .ts; asks every bare `vi.fn()` mock to carry an explicit call-signature type parameter. Real value for a handful of mocks, but for the many plain mock objects across this test suite it would mean guessing a signature that's already implied by how the mock is used (risking a type that quietly doesn't match, which defeats the point) rather than deriving it from each real function - left off rather than doing that at scale.
// oxlint-disable vitest/require-mock-type-parameters
// Third party imports
import { beforeEach, describe, expect, test, vi } from "vitest";
import { VDataTable } from "vuetify/components";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";

// Local imports
import { mockAs, setupActivePinia, vuetify } from "@ogw_tests/utils";
import CrsSelector from "@ogw_front/components/CrsSelector.vue";
import { useBackStore } from "@ogw_front/stores/back";
import { useCrsStore } from "@ogw_front/stores/crs";

vi.setConfig({ testTimeout: 10_000 });

const EXPECTED_LENGTH = 1;
const FIRST_INDEX = 0;
const ESRI_INDEX = 1;

// These are assigned in beforeEach (a real defined value by the time any test runs) rather than at declaration, so a `| undefined` type would just force needless narrowing at every call site below.
// oxlint-disable-next-line eslint/init-declarations
let pinia: ReturnType<typeof setupActivePinia>;
// oxlint-disable-next-line eslint/init-declarations
let backStore: ReturnType<typeof useBackStore>;

describe("crs selector", () => {
  beforeEach(() => {
    pinia = setupActivePinia();
    backStore = useBackStore();
    (backStore as { base_url: string }).base_url = "/";
  });

  test("default behavior", async () => {
    const crs_list = [
      {
        authority: "EPSG",
        code: "2000",
        name: "Anguilla 1957 / British West Indies Grid",
      },
    ];

    const crsStore = useCrsStore();
    crsStore.geographicList = mockAs<typeof crsStore.geographicList>(
      vi.fn().mockResolvedValue(crs_list),
    );

    const wrapper = await mountSuspended(CrsSelector, {
      global: {
        plugins: [vuetify, pinia],
      },
      props: { geodeObjectType: "BRep" },
    });
    await wrapper.vm.$nextTick();
    // A click on the row selects it: no checkbox column
    await wrapper.find("tbody tr").trigger("click");
    expect(wrapper.emitted()).toHaveProperty("update:modelValue");
    expect(wrapper.emitted<unknown[]>()["update:modelValue"]).toHaveLength(EXPECTED_LENGTH);
    expect(
      wrapper.emitted<unknown[]>()["update:modelValue"]?.[FIRST_INDEX]?.[FIRST_INDEX],
    ).toStrictEqual(crs_list[FIRST_INDEX]);
  });

  test("selects the clicked crs when codes collide across authorities", async () => {
    const crs_list = [
      { authority: "EPSG", code: "4812", name: "New Beijing / 3-degree Gauss-Kruger CM 132E" },
      { authority: "ESRI", code: "4812", name: "GCS_Voirol_Unifie_1960_Paris" },
    ];
    const crsStore = useCrsStore();
    crsStore.geographicList = mockAs<typeof crsStore.geographicList>(
      vi.fn().mockResolvedValue(crs_list),
    );

    const wrapper = await mountSuspended(CrsSelector, {
      global: {
        plugins: [vuetify, pinia],
      },
      props: { geodeObjectType: "BRep" },
    });
    await wrapper.vm.$nextTick();
    await wrapper.findAll("tbody tr")[ESRI_INDEX]?.trigger("click");
    expect(
      wrapper.emitted<unknown[]>()["update:modelValue"]?.[FIRST_INDEX]?.[FIRST_INDEX],
    ).toStrictEqual(crs_list[ESRI_INDEX]);
  });

  test("compact mode shows the authority code and the name only", async () => {
    const crs_list = [{ authority: "EPSG", code: "2154", name: "RGF93 v1 / Lambert-93" }];
    const crsStore = useCrsStore();
    crsStore.geographicList = mockAs<typeof crsStore.geographicList>(
      vi.fn().mockResolvedValue(crs_list),
    );

    const wrapper = await mountSuspended(CrsSelector, {
      global: {
        plugins: [vuetify, pinia],
      },
      props: { geodeObjectType: "BRep", compact: true },
    });
    await wrapper.vm.$nextTick();
    const headers = wrapper.findAll("th").map((header) => header.text());
    expect(headers).toStrictEqual(["Code", "Name"]);
    const cells = wrapper.findAll("tbody td").map((cell) => cell.text());
    expect(cells).toStrictEqual(["EPSG:2154", "RGF93 v1 / Lambert-93"]);
  });

  test("selects a focused row with enter and highlights it", async () => {
    const crs_list = [{ authority: "EPSG", code: "2154", name: "RGF93 v1 / Lambert-93" }];
    const crsStore = useCrsStore();
    crsStore.geographicList = mockAs<typeof crsStore.geographicList>(
      vi.fn().mockResolvedValue(crs_list),
    );

    const wrapper = await mountSuspended(CrsSelector, {
      global: {
        plugins: [vuetify, pinia],
      },
      props: {
        geodeObjectType: "BRep",
        "onUpdate:modelValue": async (crs: unknown) => {
          await wrapper.setProps({ modelValue: crs });
        },
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.find("tbody tr").trigger("keydown", { key: "Enter" });
    expect(
      wrapper.emitted<unknown[]>()["update:modelValue"]?.[FIRST_INDEX]?.[FIRST_INDEX],
    ).toStrictEqual(crs_list[FIRST_INDEX]);
    expect(wrapper.find("tbody tr").classes()).toContain("bg-primary");
  });

  test("does not offer to show all the crs at once", async () => {
    const crsStore = useCrsStore();
    crsStore.geographicList = mockAs<typeof crsStore.geographicList>(vi.fn().mockResolvedValue([]));

    const wrapper = await mountSuspended(CrsSelector, {
      global: {
        plugins: [vuetify, pinia],
      },
      props: { geodeObjectType: "BRep" },
    });
    const options = wrapper.findComponent(VDataTable).props("itemsPerPageOptions");
    expect(options).not.toContainEqual(expect.objectContaining({ value: -1 }));
    expect(options).not.toContain(-1);
  });

  test("shows the table loader while the crs list loads", async () => {
    const crsStore = useCrsStore();
    crsStore.geographicList = mockAs<typeof crsStore.geographicList>(
      vi.fn().mockReturnValue(Promise.withResolvers<never>().promise),
    );

    const wrapper = await mountSuspended(CrsSelector, {
      global: {
        plugins: [vuetify, pinia],
      },
      props: { geodeObjectType: "BRep" },
    });
    expect(wrapper.text()).toContain("Loading... Please wait");
  });
  describe("favorite and recent crs", () => {
    const NZTM = {
      authority: "EPSG",
      code: "2193",
      name: "NZGD2000 / New Zealand Transverse Mercator 2000",
    };
    const LAMBERT = { authority: "EPSG", code: "2154", name: "RGF93 v1 / Lambert-93" };
    const NZGD_3D = { authority: "EPSG", code: "4959", name: "NZGD2000" };

    async function mountShortlist(props: Record<string, unknown>): Promise<VueWrapper> {
      const crsStore = useCrsStore();
      crsStore.geographicList = mockAs<typeof crsStore.geographicList>(
        vi.fn().mockResolvedValue([NZTM, LAMBERT]),
      );
      const wrapper = await mountSuspended(CrsSelector, {
        global: { plugins: [vuetify, pinia] },
        props: { geodeObjectType: "BRep", ...props },
      });
      await wrapper.vm.$nextTick();
      return wrapper;
    }

    test("shows the favorite and recent crs present in the list as chips", async () => {
      const wrapper = await mountShortlist({ favorites: [NZTM, NZGD_3D], recent: [LAMBERT] });
      const favoriteChips = wrapper.findAll('[data-testid="crsFavoriteChip"]');
      const recentChips = wrapper.findAll('[data-testid="crsRecentChip"]');
      expect(favoriteChips).toHaveLength(EXPECTED_LENGTH);
      expect(favoriteChips[FIRST_INDEX]?.text()).toContain("EPSG:2193");
      expect(recentChips).toHaveLength(EXPECTED_LENGTH);
      expect(recentChips[FIRST_INDEX]?.text()).toContain("EPSG:2154");
    });

    test("a click on a chip selects its crs", async () => {
      const wrapper = await mountShortlist({ recent: [{ ...LAMBERT }] });
      await wrapper.find('[data-testid="crsRecentChip"]').trigger("click");
      expect(
        wrapper.emitted<unknown[]>()["update:modelValue"]?.[FIRST_INDEX]?.[FIRST_INDEX],
      ).toStrictEqual(LAMBERT);
    });

    test("no chip row without favorites or recent crs", async () => {
      const wrapper = await mountShortlist({});
      expect(wrapper.find('[data-testid="crsFavoriteChip"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="crsRecentChip"]').exists()).toBe(false);
    });

    test("the star toggles a favorite without selecting the row", async () => {
      const wrapper = await mountShortlist({ onToggleFavorite: vi.fn() });
      await wrapper.find('[data-testid="crsFavoriteToggle"]').trigger("click");
      expect(
        wrapper.emitted<unknown[]>()["toggle-favorite"]?.[FIRST_INDEX]?.[FIRST_INDEX],
      ).toStrictEqual(NZTM);
      expect(wrapper.emitted()).not.toHaveProperty("update:modelValue");
    });

    test("enter on the star does not select the row", async () => {
      const wrapper = await mountShortlist({ onToggleFavorite: vi.fn() });
      await wrapper.find('[data-testid="crsFavoriteToggle"]').trigger("keydown", { key: "Enter" });
      expect(wrapper.emitted()).not.toHaveProperty("update:modelValue");
    });

    test("no star column when nobody listens to toggle-favorite", async () => {
      const wrapper = await mountShortlist({});
      expect(wrapper.find('[data-testid="crsFavoriteToggle"]').exists()).toBe(false);
    });
  });
});
