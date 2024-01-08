// @vitest-environment nuxt

import { describe, expect, test } from "vitest"
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

for (const [geode_object, value] of Object.entries(geode_objects)) {
  describe("ObjectSelector.vue", async () => {
    test(`BRep`, async () => {
      var response = {
        allowed_objects: {},
      }
      response["allowed_objects"][geode_object] = { is_loadable: true }
      registerEndpoint(schema.$id, {
        method: schema.method,
        handler: () => response,
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
    })
  })
}
