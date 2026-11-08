// Third party imports
import { type VueWrapper, flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";

// Local imports
import ColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector.vue";
import { vuetify } from "@ogw_tests/utils";

const ID = "12345678901234567890123456789012";
const OPACITY = 0.5;
const COLOR = { red: 255, green: 0, blue: 0, alpha: OPACITY };
const RANGE = [0, 1];

async function mountSelector(coloringStyleKey: string): Promise<VueWrapper> {
  const wrapper = await mountSuspended(ColoringTypeSelector, {
    global: {
      plugins: [vuetify],
      stubs: {
        ViewerOptionsAttributeSelector: true,
        ViewerOptionsColorPicker: true,
        ViewerOptionsTexturesSelector: true,
      },
    },
    props: {
      dataId: ID,
      coloring_style_key: coloringStyleKey,
      color: COLOR,
      opacity: OPACITY,
      vertex_attribute_name: "points",
      vertex_attribute_range: RANGE,
    },
  });
  await flushPromises();
  return wrapper;
}

describe("coloringTypeSelector", () => {
  test("shows the opacity slider when coloring with an attribute", async () => {
    const wrapper = await mountSelector("vertex");
    expect(wrapper.find('[data-testid="opacitySlider"]').exists()).toBe(true);
  });

  test("hides the opacity slider when the color picker edits it", async () => {
    const wrapper = await mountSelector("constant");
    expect(wrapper.find('[data-testid="opacitySlider"]').exists()).toBe(false);
  });
});
