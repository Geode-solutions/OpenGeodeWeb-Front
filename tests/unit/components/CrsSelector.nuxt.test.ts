// Only ever fires now that tests are .ts; asks every bare `vi.fn()` mock to carry an explicit call-signature type parameter. Real value for a handful of mocks, but for the many plain mock objects across this test suite it would mean guessing a signature that's already implied by how the mock is used (risking a type that quietly doesn't match, which defeats the point) rather than deriving it from each real function - left off rather than doing that at scale.
// oxlint-disable vitest/require-mock-type-parameters
// Third party imports
import { beforeEach, describe, expect, test, vi } from "vitest";
import { VDataTable } from "vuetify/components";
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

  test("composes the selected crs with optional heights", async () => {
    const nztm = { authority: "EPSG", code: "2193", name: "NZGD2000 / NZTM 2000" };
    const nzgdNzvd = { authority: "EPSG", code: "9528", name: "NZGD2000 + NZVD2016 height" };
    const nzvd = { authority: "EPSG", code: "7839", name: "NZVD2016 height" };
    const crsStore = useCrsStore();
    crsStore.geographicList = mockAs<typeof crsStore.geographicList>(
      vi.fn().mockResolvedValue([nztm, nzgdNzvd]),
    );
    crsStore.verticalList = [nzvd];
    crsStore.compoundable = ["EPSG:2193"];

    const wrapper = await mountSuspended(CrsSelector, {
      global: { plugins: [vuetify, pinia] },
      props: { geodeObjectType: "BRep" },
    });
    await wrapper.vm.$nextTick();
    const heights = wrapper.findComponent('[data-testid="crsHeightsInput"]');
    // Nothing to complete before a crs without heights is selected
    expect(heights.props("disabled")).toBe(true);

    await wrapper.findAll("tbody tr")[FIRST_INDEX]?.trigger("click");
    expect(heights.props("disabled")).toBe(false);
    heights.vm.$emit("update:modelValue", nzvd);
    await wrapper.vm.$nextTick();
    const emitted = wrapper.emitted<unknown[]>()["update:modelValue"] ?? [];
    expect(emitted.at(-1)?.[FIRST_INDEX]).toStrictEqual({
      authority: "EPSG",
      code: "2193+7839",
      name: "NZGD2000 / NZTM 2000 + NZVD2016 height",
    });

    // A crs that already has heights: the heights are cleared
    await wrapper.findAll("tbody tr")[ESRI_INDEX]?.trigger("click");
    expect(emitted.at(-1)?.[FIRST_INDEX]).toStrictEqual(nzgdNzvd);
    // Vuetify shows an empty value as null
    expect(heights.props("modelValue")).toBeNull();
    expect(heights.props("disabled")).toBe(true);
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
});
