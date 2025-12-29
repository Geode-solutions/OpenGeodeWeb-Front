import { describe, expect, test } from "vitest"
import { mountSuspended } from "@vue/test-utils"

import Stepper from "@ogw_front/components/Stepper"
import ObjectSelector from "@ogw_front/components/ObjectSelector"
import { mountSuspended } from "@nuxt/test-utils/runtime"
import { vuetify } from "../../utils"

global.ResizeObserver = require("resize-observer-polyfill")

describe("Stepper", async () => {
  test(`Mount`, async () => {
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
              filenames: computed(() => {
                return files.value.map((file) => file.name)
              }),
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
    const wrapper = await mountSuspended(Stepper, {
      global: {
        plugins: [vuetify],
        provide: { stepper_tree },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
