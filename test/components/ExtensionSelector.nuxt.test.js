// @vitest-environment nuxt

import { describe, expect, test } from "vitest"
import { registerEndpoint, mountSuspended } from "@nuxt/test-utils/runtime"

import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

import ExtensionSelector from "@/components/ExtensionSelector.vue"
import schema from "@/assets/schemas/ExtensionSelector.json"

const vuetify = createVuetify({
  components,
  directives,
})

global.ResizeObserver = require("resize-observer-polyfill")

describe("ExtensionSelector.vue", async () => {
  test(`BRep`, async () => {
    const output_geode_object = "BRep"
    const output_extension = "msh"
    registerEndpoint(schema.$id, {
      method: schema.method,
      handler: () => ({
        geode_objects_and_output_extensions: {
          BRep: { msh: { is_saveable: true } },
        },
      }),
    })
    const wrapper = await mountSuspended(ExtensionSelector, {
      global: {
        plugins: [vuetify],
      },
      props: { input_geode_object: "BRep", filenames: ["test.toto"] },
    })
    // const first_v_card = await wrapper.findComponent(components.VCard)
    // console.log("first_v_card", first_v_card)
    // const second_v_card = first_v_card.findComponent(components.VCard)
    // console.log("second_v_card", second_v_card)

    // await second_v_card.trigger("click")
    // expect(wrapper.emitted()).toHaveProperty("update_values")
    // expect(wrapper.emitted().update_values).toHaveLength(1)
    // expect(wrapper.emitted().update_values[0][0]).toEqual({
    //   output_geode_object,
    //   output_extension,
    // })
  })
})
// }
