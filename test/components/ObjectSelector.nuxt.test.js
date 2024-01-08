// @vitest-environment nuxt

import { describe, expect, test } from "vitest"
import { mount, flushPromises, shallowMount } from "@vue/test-utils"
import { registerEndpoint, mountSuspended } from "@nuxt/test-utils/runtime"

import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

import ObjectSelector from "@/components/ObjectSelector.vue"

import schema from "@/assets/schemas/ObjectSelector.json"

import geode_objects from "@/assets/geode_objects"

// import vuetify from "@/plugins/vuetify"
const vuetify = createVuetify({
  components,
  directives,
})

global.ResizeObserver = require("resize-observer-polyfill")

describe("ObjectSelector.vue", async () => {
  test("Renders properly", async () => {
    // registerEndpoint(schema.$id, {
    //   method: schema.method,
    //   handler: () => ({
    //     allowed_objects: {
    //       StructuralModel: { is_loadable: true },
    //     },
    //   }),
    // })
    const wrapper = await mountSuspended(ObjectSelector, {
      global: {
        plugins: [vuetify],
      },
      props: { filenames: ["test.toto"], key: "test" },
    })
    expect(wrapper.find(".v-card").exists()).toBe(true)
  })

  test("Select geode_objects", async () => {
    for (const [geode_object, value] of Object.entries(geode_objects)) {
      registerEndpoint(schema.$id, {
        method: schema.method,
        handler: () => ({
          allowed_objects: {
            geode_object: { is_loadable: true },
          },
        }),
      })
      const wrapper = await mountSuspended(ObjectSelector, {
        global: {
          plugins: [vuetify],
        },
        props: { filenames: ["test.toto"], key: "test" },
      })
      const v_card = wrapper.findComponent(components.VCard)
      const v_img = v_card.findComponent(components.VImg)
      expect(v_img.vm.src).toContain(`/${geode_object}.svg`)
      await v_card.trigger("click")
      expect(wrapper.emitted()).toHaveProperty("update_values")
      expect(wrapper.emitted().update_values).toHaveLength(1)
      expect(wrapper.emitted().update_values[0][0]).toEqual({
        input_geode_object: geode_object,
      })
    }
  })

  // test("Select StructuralModel geode_object", async () => {
  //   registerEndpoint(schema.$id, {
  //     method: schema.method,
  //     handler: () => ({
  //       allowed_objects: {
  //         BRep: { is_loadable: true },
  //         StructuralModel: { is_loadable: true },
  //       },
  //     }),
  //   })
  //   const wrapper = await mountSuspended(ObjectSelector, {
  //     global: {
  //       plugins: [vuetify],
  //     },
  //     props: { filenames: ["test.toto", "test.tutu"], key: "test" },
  //   })
  //   const v_cards = await wrapper.findAll(".v-card")
  //   expect(v_cards.length).toEqual(2)
  //   await v_cards[1].trigger("click")
  //   expect(wrapper.emitted()).toHaveProperty("update_values")
  //   expect(wrapper.emitted().update_values).toHaveLength(1)
  //   expect(wrapper.emitted().update_values[0][0]).toEqual({
  //     input_geode_object: "BRep",
  //   })
  // })
})
