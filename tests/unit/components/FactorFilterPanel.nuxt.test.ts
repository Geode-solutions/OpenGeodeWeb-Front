// Node imports
import { setTimeout as wait } from "node:timers/promises";

// Third party imports
import { type Mock, describe, expect, test, vi } from "vitest";
import { type VueWrapper, flushPromises } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";

// Local imports
import FactorFilterPanel from "@ogw_front/components/FactorFilterPanel.vue";
import { vuetify } from "@ogw_tests/utils";

const DATA_ID = "12345678901234567890123456789012";
const DEFAULT_VALUE = 0.5;
const NEUTRAL_VALUE = 0;
const DEBOUNCE_WAIT = 300;
const TIMEOUT = 5000;

type SetFactor = (ids: string[], factor: number) => Promise<void>;

vi.mock(import("@ogw_front/stores/data") as Promise<unknown>, () => ({
  useDataStore: (): { refAllItems: () => Ref<{ id: string; name: string }[]> } => ({
    refAllItems: (): Ref<{ id: string; name: string }[]> => ref([{ id: DATA_ID, name: "model" }]),
  }),
}));
vi.mock(import("@ogw_front/stores/hybrid_viewer") as Promise<unknown>, () => ({
  useHybridViewerStore: (): { hybridDb: Record<string, never> } => ({ hybridDb: {} }),
}));

function mockSetFactor(): Mock<SetFactor> {
  return vi.fn<SetFactor>().mockResolvedValue();
}

async function mountOpenedPanel(setFactor: SetFactor): Promise<VueWrapper> {
  const wrapper = await mountSuspended(FactorFilterPanel, {
    global: { plugins: [vuetify] },
    props: {
      show: false,
      title: "Exploded View",
      label: "Explode Factor",
      testIdPrefix: "explode",
      setFactor,
      factorRange: {
        min: 0,
        max: 2,
        defaultValue: DEFAULT_VALUE,
        neutralValue: NEUTRAL_VALUE,
      },
    },
  });
  await wrapper.setProps({ show: true });
  await flushPromises();
  return wrapper;
}

async function settle(): Promise<void> {
  await wait(DEBOUNCE_WAIT);
  await flushPromises();
}

describe("factor filter panel", () => {
  test(
    "applies the default factor once when opened",
    async () => {
      const setFactor = mockSetFactor();
      await mountOpenedPanel(setFactor);
      await settle();
      expect(setFactor.mock.calls).toStrictEqual([[[DATA_ID], DEFAULT_VALUE]]);
    },
    TIMEOUT,
  );

  test(
    "remove sends a single request with the neutral factor",
    async () => {
      const setFactor = mockSetFactor();
      const wrapper = await mountOpenedPanel(setFactor);
      await settle();
      setFactor.mockClear();
      await wrapper.find('[data-testid="removeExplodeButton"]').trigger("click");
      await settle();
      expect(setFactor.mock.calls).toStrictEqual([[[DATA_ID], NEUTRAL_VALUE]]);
    },
    TIMEOUT,
  );

  test(
    "reset sends a single request with the default factor",
    async () => {
      const setFactor = mockSetFactor();
      const wrapper = await mountOpenedPanel(setFactor);
      await settle();
      await wrapper.find('[data-testid="removeExplodeButton"]').trigger("click");
      await settle();
      setFactor.mockClear();
      await wrapper.find('[data-testid="resetExplodeButton"]').trigger("click");
      await settle();
      expect(setFactor.mock.calls).toStrictEqual([[[DATA_ID], DEFAULT_VALUE]]);
    },
    TIMEOUT,
  );
});
