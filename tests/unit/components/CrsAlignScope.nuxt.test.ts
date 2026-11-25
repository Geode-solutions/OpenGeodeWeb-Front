// Third party imports
import { beforeEach, describe, expect, test, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { ref } from "vue";

// Local imports
import { applyPoints, item, mountWithWells } from "@ogw_tests/unit/helpers/crs_align";
import { setupActivePinia, vuetify } from "@ogw_tests/utils";
import CrsAlign from "@ogw_front/components/CrsAlign.vue";
import type CrsSelector from "@ogw_front/components/CrsSelector.vue";
import type GlassCard from "@ogw_front/components/GlassCard.vue";
import type { useCrs } from "@ogw_front/composables/crs";
import { useCrsStore } from "@ogw_front/stores/crs";
import { useDataStore } from "@ogw_front/stores/data";
import { useFeedbackStore } from "@ogw_front/stores/feedback";
import { useViewerStore } from "@ogw_front/stores/viewer";

vi.setConfig({ testTimeout: 10_000 });

// Hoisted with vi.mock, so the GlassCard stub renders the content only
const { GLASS_CARD_STUB } = vi.hoisted(() => ({
  GLASS_CARD_STUB: {
    name: "GlassCard",
    template: "<div class='glass-card-stub'><slot /></div>",
  },
}));

// Hoisted with vi.mock, so the CrsSelector stub can emit LAMBERT
const { LAMBERT, CRS_SELECTOR_STUB, USE_CRS_MOCK, alignCrs, followProject } = vi.hoisted(() => {
  const lambert = { authority: "EPSG", code: "2154", name: "RGF93 v1 / Lambert-93" };
  const alignMock = vi.fn<(...args: unknown[]) => Promise<unknown>>();
  const followMock = vi.fn<(...args: unknown[]) => Promise<void>>();
  return {
    LAMBERT: lambert,
    alignCrs: alignMock,
    followProject: followMock,
    USE_CRS_MOCK: (): unknown => ({
      alignCrs: alignMock,
      followProject: followMock,
      convertCrs: vi.fn<() => Promise<void>>(),
    }),
    CRS_SELECTOR_STUB: {
      name: "CrsSelector",
      emits: ["update:modelValue"],
      data: (): { crs: typeof lambert } => ({ crs: lambert }),
      template:
        "<button data-testid='crsSelectorStub' @click=\"$emit('update:modelValue', crs)\" />",
    },
  };
});

vi.mock(import("@ogw_front/components/GlassCard.vue"), () => ({
  // oxlint-disable-next-line no-unsafe-type-assertion -- stub only implements the subset of the component this suite touches
  default: GLASS_CARD_STUB as unknown as typeof GlassCard,
}));

vi.mock(import("@ogw_front/components/CrsSelector.vue"), () => ({
  // oxlint-disable-next-line no-unsafe-type-assertion -- stub only implements the subset of the component this suite touches
  default: CRS_SELECTOR_STUB as unknown as typeof CrsSelector,
}));

vi.mock(import("@ogw_front/composables/crs"), () => ({
  // oxlint-disable-next-line no-unsafe-type-assertion -- mock covers only the calls this suite makes
  useCrs: USE_CRS_MOCK as unknown as typeof useCrs,
}));

describe("crs align tool scope", () => {
  beforeEach(() => {
    setupActivePinia();
    // The data being aligned stays in the data store
    vi.spyOn(useDataStore(), "refItem").mockReturnValue(ref(item));
    vi.spyOn(useViewerStore(), "request").mockResolvedValue(undefined);
    alignCrs.mockReset().mockResolvedValue(undefined);
    followProject.mockReset().mockResolvedValue(undefined);
  });

  test("georeferences every data in the same crs state by default, then follows the project", async () => {
    const success = vi.spyOn(useFeedbackStore(), "add_success");
    const utm = { authority: "EPSG", code: "32631", name: "WGS 84 / UTM zone 31N" };
    const { wrapper, wells } = mountWithWells(LAMBERT);
    useCrsStore().setProjectCrs(utm);
    expect(wrapper.find('[data-testid="crsAlignScope-all"] input').element).toHaveProperty(
      "checked",
      true,
    );
    await applyPoints(wrapper);

    expect(alignCrs).toHaveBeenCalledWith(
      item,
      LAMBERT,
      expect.objectContaining({ linkedItems: [wells] }),
    );
    expect(followProject).toHaveBeenCalledWith(
      [
        { data_id: item.data_id, name: item.name, crs: LAMBERT },
        { data_id: "item-2", name: "Wells", crs: LAMBERT },
      ],
      utm,
    );
    expect(success).toHaveBeenCalledWith("Data georeferenced (2 items)");
    wrapper.unmount();
  });

  // Data in the same CRS are usually the whole project: a re-align moves this data only by default
  test("re-aligning a georeferenced data defaults to this data only", async () => {
    useCrsStore().openCrsAlign({ ...item, crs: LAMBERT });
    const wrapper = mount(CrsAlign, { global: { plugins: [vuetify] } });
    await flushPromises();
    expect(wrapper.find('[data-testid="crsAlignScope-one"] input').element).toHaveProperty(
      "checked",
      true,
    );
    wrapper.unmount();
  });

  test("georeferences this data only", async () => {
    const { wrapper } = mountWithWells(LAMBERT);
    await wrapper.find('[data-testid="crsAlignScope-one"] input').setValue(true);
    await applyPoints(wrapper);

    expect(alignCrs).toHaveBeenCalledWith(
      item,
      LAMBERT,
      expect.objectContaining({ linkedItems: [] }),
    );
    expect(followProject).toHaveBeenCalledWith(
      [{ data_id: item.data_id, name: item.name, crs: LAMBERT }],
      // The map is the only georeferenced data: the project is in its crs
      LAMBERT,
    );
    wrapper.unmount();
  });
});
