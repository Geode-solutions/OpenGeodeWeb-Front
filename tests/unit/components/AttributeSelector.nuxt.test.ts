// Third party imports
import { type VueWrapper, flushPromises } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";

// Local imports
import AttributeSelector from "@ogw_front/components/Viewer/Options/AttributeSelector.vue";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { vuetify } from "@ogw_tests/utils";

const ATTRIBUTE_RANGE = [0, 1];
const OUT_OF_RANGE_STEP = 5;
const LAST_STEP = 2;
const HALF = 0.5;
const RANGE_MIN = 2;
const RANGE_MAX = 3;

function makeAttribute(attribute_name: string, time_steps: number[]): Record<string, unknown> {
  return {
    attribute_name,
    attribute_id: attribute_name,
    nb_items: 1,
    time_steps,
  };
}

type BackRequest = (
  request: { schema: { $id: string } },
  options?: { response_function: (response: unknown) => void },
) => unknown;

const ATTRIBUTES = [
  makeAttribute("temperature", [HALF, 1, 2]),
  makeAttribute("single_step", [3]),
  makeAttribute("plain", []),
];

vi.mock(import("@ogw_front/stores/back") as Promise<unknown>, () => ({
  useBackStore: (): { request: unknown } => ({
    request: vi.fn<BackRequest>().mockImplementation(({ schema }, options) => {
      if (schema.$id.endsWith("attribute_range")) {
        return { min_values: [RANGE_MIN], max_values: [RANGE_MAX], no_data: true };
      }
      options?.response_function({ attributes: ATTRIBUTES });
      return undefined;
    }),
  }),
}));
vi.mock(import("@ogw_front/composables/batch_style") as Promise<unknown>, () => ({
  useBatchGroup: (): Ref<undefined> => ref<undefined>(undefined),
}));

async function mountSelector(
  attributeName: string,
  attributeTimeStep?: number,
  attributeRange: (number | undefined)[] = ATTRIBUTE_RANGE,
): Promise<VueWrapper> {
  const wrapper = await mountSuspended(AttributeSelector, {
    global: { plugins: [vuetify] },
    props: {
      id: "id",
      schema: back_schemas.opengeodeweb_back.vertex_attribute_names,
      attributeName,
      attributeItem: 0,
      attributeRange,
      attributeColorMap: "batlow",
      attributeTimeStep,
    },
  });
  await flushPromises();
  return wrapper;
}

describe("attributeSelector time steps", () => {
  test("shows the slider and the current time for a series", async () => {
    const wrapper = await mountSelector("temperature", 1);

    expect(wrapper.find('[data-testid="timeStepSlider"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="timeStepValue"]').text()).toBe("t = 1");
  });

  test("hides the slider for a non temporal attribute", async () => {
    const wrapper = await mountSelector("plain");

    expect(wrapper.find('[data-testid="timeStepSlider"]').exists()).toBe(false);
    expect(wrapper.emitted("update:attributeTimeStep")).toBeUndefined();
  });

  test("hides the slider but selects step 0 for a single step series", async () => {
    const wrapper = await mountSelector("single_step");

    expect(wrapper.find('[data-testid="timeStepSlider"]').exists()).toBe(false);
    expect(wrapper.emitted("update:attributeTimeStep")?.at(-1)).toStrictEqual([0]);
  });

  test("selects step 0 when a series has no stored step", async () => {
    const wrapper = await mountSelector("temperature");

    expect(wrapper.emitted("update:attributeTimeStep")?.at(-1)).toStrictEqual([0]);
  });

  test("brings an out of range step back to 0", async () => {
    const wrapper = await mountSelector("temperature", OUT_OF_RANGE_STEP);

    expect(wrapper.emitted("update:attributeTimeStep")?.at(-1)).toStrictEqual([0]);
  });

  test("commits a valid stored step when the series is selected", async () => {
    const wrapper = await mountSelector("temperature", LAST_STEP);

    expect(wrapper.emitted("update:attributeTimeStep")?.at(-1)).toStrictEqual([LAST_STEP]);
  });

  test("does not reset the range when the step changes", async () => {
    const wrapper = await mountSelector("temperature", 0);
    await wrapper.setProps({ attributeTimeStep: LAST_STEP });
    await flushPromises();

    expect(wrapper.emitted("update:attributeRange")).toBeUndefined();
  });

  test("requests the range of the selected attribute when it is unset", async () => {
    const wrapper = await mountSelector("plain", undefined, []);

    expect(wrapper.emitted("update:attributeRange")?.at(-1)).toStrictEqual([
      [RANGE_MIN, RANGE_MAX],
    ]);
    expect(wrapper.find('[data-testid="noDataInfo"]').exists()).toBe(true);
  });
});
