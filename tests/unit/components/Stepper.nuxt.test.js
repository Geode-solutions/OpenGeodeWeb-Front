import { computed, ref, shallowRef } from "vue";
import { describe, expect, test } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { useStepperTree } from "@ogw_front/composables/stepper_tree.js";
import { vuetify } from "@ogw_tests/utils";

import ObjectSelector from "@ogw_front/components/ObjectSelector";
import ResizeObserver from "resize-observer-polyfill";
import Stepper from "@ogw_front/components/Stepper";

globalThis.ResizeObserver = ResizeObserver;

describe("stepper", () => {
  test("mount", async () => {
    const geode_object_type = ref("BRep");
    const files = ref([]);
    const stepper_tree = useStepperTree(
      [
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
      { geode_object_type },
    );
    const wrapper = await mountSuspended(Stepper, {
      global: {
        plugins: [vuetify],
      },
      props: { stepper_tree },
    });
    expect(wrapper.exists()).toBe(true);
  });
});
