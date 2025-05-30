import { describe, expect, test } from "vitest"
import { mountSuspended } from "@vue/test-utils"

import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

import Stepper from "@ogw_f/components/Stepper.vue"
import ObjectSelector from "@ogw_f/components/ObjectSelector.vue"
import { mountSuspended } from "@nuxt/test-utils/runtime"

const vuetify = createVuetify({
  components,
  directives,
})

global.ResizeObserver = require("resize-observer-polyfill")

describe("Stepper.vue", async () => {
  test(`Mount`, async () => {
    const input_geode_object = ref("BRep")
    const files = ref([])
    const stepper_tree = reactive({
      current_step_index: ref(0),
      input_geode_object,
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
            if (input_geode_object.value === "") {
              return []
            } else {
              return [input_geode_object.value]
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
