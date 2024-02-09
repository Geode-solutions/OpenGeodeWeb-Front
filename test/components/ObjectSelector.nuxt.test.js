// @vitest-environment nuxt

import { describe, expect, test } from "vitest"
import { registerEndpoint, mountSuspended } from "@nuxt/test-utils/runtime"
import { flushPromises } from "@vue/test-utils"

import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

import ObjectSelector from "@/components/ObjectSelector.vue"

import schemas from "@geode/opengeodeweb-back/schemas.json"

const allowed_objects = schemas.opengeodeweb_back.allowed_objects

const vuetify = createVuetify({
  components,
  directives,
})

const geode_object = "BRep"
describe("ObjectSelector.vue", async () => {
  test(`BRep`, async () => {
    var response = {
      allowed_objects: {},
    }
    response["allowed_objects"][geode_object] = { is_loadable: true }
    registerEndpoint(allowed_objects.$id, {
      method: allowed_objects.methods[0],
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
    expect(v_img.vm.src).toContain(`${geode_object}.svg`)
    await v_card.trigger("click")
    expect(wrapper.emitted()).toHaveProperty("update_values")
    expect(wrapper.emitted().update_values).toHaveLength(1)
    expect(wrapper.emitted().update_values[0][0]).toEqual({
      input_geode_object: geode_object,
    })
  })
})
