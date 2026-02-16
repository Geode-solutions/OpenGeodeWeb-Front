import { computed, reactive, ref, shallowRef } from "vue"
import { describe, expect, test } from "vitest"
import ResizeObserver from "resize-observer-polyfill"
import { mount } from "@vue/test-utils"

import ObjectSelector from "@ogw_front/components/ObjectSelector"
import Step from "@ogw_front/components/Step"

import { vuetify } from "../../utils"

global.ResizeObserver = ResizeObserver

describe(Step, () => {
  test(`BRep`, async () => {
    const geode_object_type = ref("BRep")
    const files = ref([])
    const stepper_tree = reactive({
      current_step_index: ref(0),
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
          chips: computed(() => {
            if (geode_object_type.value === "") {
              return []
            } else {
              return [geode_object_type.value]
            }
          }),
        },
      ],
    })
    const wrapper = mount(Step, {
      global: {
        plugins: [vuetify],
        provide: { stepper_tree },
      },
      props: { step_index: 0 },
    })
    expect(wrapper.exists()).toBeTruthy()
  })
})
