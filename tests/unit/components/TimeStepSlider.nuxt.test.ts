// Third party imports
import { type VueWrapper, flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import { VSlider } from "vuetify/components";
import { mountSuspended } from "@nuxt/test-utils/runtime";

// Local imports
import TimeStepSlider from "@ogw_front/components/Viewer/Options/TimeStepSlider.vue";
import { vuetify } from "@ogw_tests/utils";

const LAST_STEP = 2;

async function mountSlider(timeSteps: number[]): Promise<VueWrapper> {
  const wrapper = await mountSuspended(TimeStepSlider, {
    global: { plugins: [vuetify] },
    props: { timeSteps, modelValue: 0 },
  });
  await flushPromises();
  return wrapper;
}

describe("timeStepSlider", () => {
  test("renders the slider only for more than one step", async () => {
    const single = await mountSlider([1]);
    const series = await mountSlider([0, 1, LAST_STEP]);

    expect(single.find('[data-testid="timeStepSlider"]').exists()).toBe(false);
    expect(series.find('[data-testid="timeStepSlider"]').exists()).toBe(true);
  });

  test("emits the new step on end", async () => {
    const wrapper = await mountSlider([0, 1, LAST_STEP]);
    wrapper.findComponent(VSlider).vm.$emit("end", LAST_STEP);
    await flushPromises();

    expect(wrapper.emitted("update:modelValue")?.at(-1)).toStrictEqual([
      LAST_STEP,
    ]);
  });
});
