// Third party imports
import { type VueWrapper, flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";

// Local imports
import AttributeRangeSelector from "@ogw_front/components/Viewer/Options/AttributeRangeSelector.vue";
import { vuetify } from "@ogw_tests/utils";

const MINIMUM = 0;
const MAXIMUM = 10;
const SCIENTIFIC_VALUE = 1.5e7;

async function mountSelector(): Promise<VueWrapper> {
  const wrapper = await mountSuspended(AttributeRangeSelector, {
    global: { plugins: [vuetify] },
    props: { minimum: MINIMUM, maximum: MAXIMUM },
  });
  await flushPromises();
  return wrapper;
}

describe("attributeRangeSelector", () => {
  test("accepts scientific notation on enter", async () => {
    const wrapper = await mountSelector();
    const input = wrapper.find('[data-testid="attributeMaxInput"] input');
    await input.setValue("1.5e");
    await input.setValue("1.5e7");
    await input.trigger("keydown", { key: "Enter" });
    await flushPromises();

    expect(wrapper.emitted("update:maximum")).toStrictEqual([[SCIENTIFIC_VALUE]]);
  });

  test("ignores invalid values", async () => {
    const wrapper = await mountSelector();
    const input = wrapper.find<HTMLInputElement>('[data-testid="attributeMinInput"] input');
    await input.setValue("abc");
    await input.trigger("blur");
    await flushPromises();

    expect(wrapper.emitted("update:minimum")).toBeUndefined();
    expect(input.element.value).toBe(String(MINIMUM));
  });
});
