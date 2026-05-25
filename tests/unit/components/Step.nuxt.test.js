import { computed, ref, shallowRef } from "vue";
import { describe, expect, test } from "vitest";
import ResizeObserver from "resize-observer-polyfill";
import { mount } from "@vue/test-utils";

import ObjectSelector from "@ogw_front/components/ObjectSelector";
import Step from "@ogw_front/components/Step";
import { useStepperTree } from "@ogw_front/composables/stepper_tree";

import { vuetify } from "@ogw_tests/utils";

globalThis.ResizeObserver = ResizeObserver;

describe("step", () => {
  test("brep", () => {
    const geode_object_type = ref("BRep");
    const files = ref([]);
    const stepper_tree = useStepperTree({
      geode_object_type,
      steps: [
        {
          step_title: "Confirm the data type",
          component: {
            component_name: shallowRef(ObjectSelector),
            component_options: {
              filenames: computed(() => files.value.map((file) => file.name)),
              key: "",
            },
          },
          chips: computed(() => [geode_object_type.value].filter((chip) => chip !== "")),
        },
      ],
    });
    const wrapper = mount(Step, {
      global: {
        plugins: [vuetify],
      },
      props: { step_index: 0, stepper_tree },
    });
    expect(wrapper.exists()).toBe(true);
  });
});
