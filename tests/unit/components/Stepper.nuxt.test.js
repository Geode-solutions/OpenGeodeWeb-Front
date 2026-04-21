// Third party imports
import { computed, reactive, ref, shallowRef } from "vue";
import { describe, expect, test } from "vitest";
import ResizeObserver from "resize-observer-polyfill";
import { mountSuspended } from "@nuxt/test-utils/runtime";

// Local imports
import ObjectSelector from "@ogw_front/components/ObjectSelector";
import Stepper from "@ogw_front/components/Stepper";
import { vuetify } from "@ogw_tests/utils";

const FIRST_INDEX = 0;

globalThis.ResizeObserver = ResizeObserver;

describe("stepper", () => {
  test("mount", async () => {
    const geode_object_type = ref("BRep");
    const files = ref([]);
    const stepper_tree = reactive({
      current_step_index: ref(FIRST_INDEX),
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
    const wrapper = await mountSuspended(Stepper, {
      global: {
        plugins: [vuetify],
        provide: { stepper_tree },
      },
    });
    expect(wrapper.exists()).toBe(true);
  });
});
