// oxlint-disable vitest/require-mock-type-parameters
// Third party imports
import { type VueWrapper, flushPromises } from "@vue/test-utils";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";

// Local imports
import { mockAs, setupActivePinia, vuetify } from "@ogw_tests/utils";
import CrsSelector from "@ogw_front/components/CrsSelector.vue";
import { useBackStore } from "@ogw_front/stores/back";
import { useCrsStore } from "@ogw_front/stores/crs";

vi.setConfig({ testTimeout: 10_000 });

const EXPECTED_LENGTH = 1;
const FIRST_INDEX = 0;
const PAGE_SIZE = 10;

// oxlint-disable-next-line eslint/init-declarations
let pinia: ReturnType<typeof setupActivePinia>;

describe("favorite and recent crs", () => {
  beforeEach(() => {
    pinia = setupActivePinia();
    (useBackStore() as { base_url: string }).base_url = "/";
  });

  const NZTM = {
    authority: "EPSG",
    code: "2193",
    name: "NZGD2000 / New Zealand Transverse Mercator 2000",
  };
  const LAMBERT = { authority: "EPSG", code: "2154", name: "RGF93 v1 / Lambert-93" };
  const NZGD_3D = { authority: "EPSG", code: "4959", name: "NZGD2000" };

  async function mountShortlist(
    props: Record<string, unknown>,
    crsList = [NZTM, LAMBERT],
  ): Promise<VueWrapper> {
    const crsStore = useCrsStore();
    crsStore.geographicList = mockAs<typeof crsStore.geographicList>(
      vi.fn().mockResolvedValue(crsList),
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

  test("shows the favorites and the recent crs in their own labeled row", async () => {
    const favoritesOnly = await mountShortlist({ favorites: [NZTM] });
    expect(favoritesOnly.find('[data-testid="crsFavoriteRow"]').text()).toContain("Favorites");
    expect(favoritesOnly.find('[data-testid="crsRecentRow"]').exists()).toBe(false);
    const recentOnly = await mountShortlist({ recent: [LAMBERT] });
    expect(recentOnly.find('[data-testid="crsRecentRow"]').text()).toContain("Recent");
    expect(recentOnly.find('[data-testid="crsFavoriteRow"]').exists()).toBe(false);
  });

  test("a click on a chip selects its crs", async () => {
    const wrapper = await mountShortlist({ recent: [{ ...LAMBERT }] });
    await wrapper.find('[data-testid="crsRecentChip"]').trigger("click");
    expect(
      wrapper.emitted<unknown[]>()["update:modelValue"]?.[FIRST_INDEX]?.[FIRST_INDEX],
    ).toStrictEqual(LAMBERT);
  });

  test("a click on a chip shows its crs highlighted in the table", async () => {
    const others = Array.from({ length: PAGE_SIZE + 1 }, (_unused, index) => ({
      authority: "EPSG",
      code: String(index),
      name: `Other ${index}`,
    }));
    const wrapper = await mountShortlist(
      {
        favorites: [LAMBERT],
        "onUpdate:modelValue": async (crs: unknown) => {
          await wrapper.setProps({ modelValue: crs });
        },
      },
      [...others, LAMBERT],
    );
    await wrapper.find('[data-testid="crsSearchInput"] input').setValue("Other");
    await wrapper.find('[data-testid="crsFavoriteChip"]').trigger("click");
    await flushPromises();
    const selectedRow = wrapper.find("tbody tr.bg-primary");
    expect(selectedRow.text()).toContain("RGF93 v1 / Lambert-93");
  });

  test("no chip row nor star column without a shortlist", async () => {
    const wrapper = await mountShortlist({});
    expect(wrapper.find('[data-testid="crsFavoriteChip"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="crsRecentChip"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="crsFavoriteToggle"]').exists()).toBe(false);
  });

  test("the star toggles a favorite without selecting the row", async () => {
    const wrapper = await mountShortlist({ onToggleFavorite: vi.fn() });
    await wrapper.find('[data-testid="crsFavoriteToggle"]').trigger("click");
    expect(
      wrapper.emitted<unknown[]>()["toggle-favorite"]?.[FIRST_INDEX]?.[FIRST_INDEX],
    ).toStrictEqual(NZTM);
    expect(wrapper.emitted()).not.toHaveProperty("update:modelValue");
  });

  test("a favorite shows a filled star on its row and its chip", async () => {
    const wrapper = await mountShortlist({ favorites: [NZTM], onToggleFavorite: vi.fn() });
    for (const testid of ["crsFavoriteToggle", "crsFavoriteChip"]) {
      expect(wrapper.find(`[data-testid="${testid}"] i`).classes()).toContain("ph-fill");
    }
  });

  test("enter on the star does not select the row", async () => {
    const wrapper = await mountShortlist({ onToggleFavorite: vi.fn() });
    await wrapper.find('[data-testid="crsFavoriteToggle"]').trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted()).not.toHaveProperty("update:modelValue");
  });
});
