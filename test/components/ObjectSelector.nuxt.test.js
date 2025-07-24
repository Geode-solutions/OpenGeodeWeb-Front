import { describe, expect, test } from "vitest"
import { registerEndpoint, mountSuspended } from "@nuxt/test-utils/runtime"
import { flushPromises } from "@vue/test-utils"

import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"
import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"

import ObjectSelector from "@ogw_f/components/ObjectSelector.vue"

import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"

const allowed_objects = schemas.opengeodeweb_back.allowed_objects

const vuetify = createVuetify({
  components,
  directives,
})

describe("ObjectSelector.vue", async () => {
  const pinia = createTestingPinia()
  setActivePinia(pinia)
  const geode_store = use_geode_store()
  geode_store.base_url = ""

  test(`test loadable with one class`, async () => {
    var response = {
      allowed_objects: {},
    }
    const geode_object_1 = "BRep"
    response["allowed_objects"][geode_object_1] = { is_loadable: true }
    registerEndpoint(allowed_objects.$id, {
      method: allowed_objects.methods[0],
      handler: () => response,
    })
    const wrapper = await mountSuspended(ObjectSelector, {
      global: {
        plugins: [vuetify, pinia],
      },
      props: { filenames: ["test.toto"], supported_feature: "test" },
    })
    const v_card = wrapper.findComponent(components.VCard)
    const v_img = v_card.findComponent(components.VImg)
    expect(v_img.vm.src).toContain(`${geode_object_1}.svg`)
    expect(wrapper.emitted()).toHaveProperty("update_values")
    expect(wrapper.emitted().update_values).toHaveLength(1)
    expect(wrapper.emitted().update_values[0][0]).toEqual({
      input_geode_object: geode_object_1,
    })
  })

  test(`test loabable with multiple classes`, async () => {
    var response = {
      allowed_objects: {},
    }
    const geode_object_1 = "BRep"
    const geode_object_2 = "EdgedCurve3D"
    response["allowed_objects"][geode_object_1] = { is_loadable: true }
    response["allowed_objects"][geode_object_2] = { is_loadable: true }
    registerEndpoint(allowed_objects.$id, {
      method: allowed_objects.methods[0],
      handler: () => response,
    })
    const wrapper = await mountSuspended(ObjectSelector, {
      global: {
        plugins: [vuetify, pinia],
      },
      props: { filenames: ["test.toto"], supported_feature: "test" },
    })
    const v_card = wrapper.findComponent(components.VCard)
    const v_img = v_card.findComponent(components.VImg)
    expect(v_img.vm.src).toContain(`${geode_object_1}.svg`)
    await flushPromises()
    await flushPromises()
    await v_card.trigger("click")
    await flushPromises()
    await flushPromises()
    expect(wrapper.emitted()).toHaveProperty("update_values")
    expect(wrapper.emitted().update_values).toHaveLength(1)
    expect(wrapper.emitted().update_values[0][0]).toEqual({
      input_geode_object: geode_object_1,
    })
  })
})
