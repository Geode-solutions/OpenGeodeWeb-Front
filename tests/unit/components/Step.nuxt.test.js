import { describe, expect, test } from "vitest"
import { mount } from "@vue/test-utils"

import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

import Step from "@ogw_front/components/Step"
import ObjectSelector from "@ogw_front/components/ObjectSelector"

const vuetify = createVuetify({
  components,
  directives,
})

global.ResizeObserver = require("resize-observer-polyfill")

describe("Step", async () => {
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
    const wrapper = mount(Step, {
      global: {
        plugins: [vuetify],
        provide: { stepper_tree },
      },
      props: { step_index: 0 },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
