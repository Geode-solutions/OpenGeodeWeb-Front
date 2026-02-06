import { computed, reactive, ref, shallowRef } from "vue"
import { describe, expect, test } from "vitest"

import ObjectSelector from "@ogw_front/components/ObjectSelector"
import ResizeObserver from "resize-observer-polyfill"
import Stepper from "@ogw_front/components/Stepper"
import { mountSuspended } from "@nuxt/test-utils/runtime"
import { vuetify } from "../../utils"

const FIRST_INDEX = 0

global.ResizeObserver = ResizeObserver

describe(Stepper, () => {
  test(`Mount`, async () => {
    const geode_object_type = ref("BRep")
    const files = ref([])
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
          chips: computed(() => {
            if (geode_object_type.value === "") {
              return []
            }
            return [geode_object_type.value]
          }),
        },
      ],
    })
    const wrapper = await mountSuspended(Stepper, {
      global: {
        plugins: [vuetify],
        provide: { stepper_tree },
      },
    })
    expect(wrapper.exists()).toBeTruthy()
  })
})
