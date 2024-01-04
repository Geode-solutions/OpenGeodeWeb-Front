// @vitest-environment nuxt

import { describe, expect, test } from "vitest"
import { mount, flushPromises, shallowMount } from "@vue/test-utils"
// import vuetify from "vite-plugin-vuetify"
import { registerEndpoint, mountSuspended } from "@nuxt/test-utils/runtime"

import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

import ObjectSelector from "@/components/ObjectSelector.vue"
import FetchingData from "@/components/FetchingData.vue"

import schema from "@/assets/schemas/ObjectSelector.json"

// import vuetify from "@/plugins/vuetify"
const vuetify = createVuetify({
  components,
  directives,
})

global.ResizeObserver = require("resize-observer-polyfill")

describe("ObjectSelector.vue", async () => {
  // test("Renders properly", async () => {
  //   const wrapper = mount(ObjectSelector, {
  //     global: {
  //       plugins: [vuetify],
  //     },
  //     props: { filenames: ["test.toto"], key: "test" },
  //   })
  //   expect(wrapper.find(".v-row").exists()).toBe(true)
  //   // expect(wrapper.find(FetchingData).exists()).toBe(true)
  // })

  test("Select geode_object", async () => {
    console.log(schema.$id)
    registerEndpoint(schema.$id, {
      method: schema.method,
      handler: () => ({
        allowed_objects: {
          BRep: { is_loadable: true },
          StructuralModel: { is_loadable: true },
        },
      }),
    })
    console.log("mountSuspended")
    const wrapper = await mountSuspended(ObjectSelector, {
      global: {
        plugins: [vuetify],
      },
      props: { filenames: ["test.toto", "test.tutu"], key: "test" },
    })
    console.log("wrapper")

    // await wrapper.vm.get_allowed_objects()
    // console.log(wrapper.vm)
    // const compo = wrapper.findComponent(ObjectSelector)
    // console.log(wrapper.vm)

    // const cards = wrapper.findAll(".v-card")
    // console.log("cards.length", cards.length)
    expect(wrapper.emitted().update_values).toEqual({
      input_geode_object: "BRep",
    })
  })
})
