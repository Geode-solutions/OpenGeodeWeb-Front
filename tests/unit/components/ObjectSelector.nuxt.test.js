import { describe, expect, test, vi } from "vitest"
import { registerEndpoint, mountSuspended } from "@nuxt/test-utils/runtime"
import { flushPromises } from "@vue/test-utils"

import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"
import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"

import ObjectSelector from "@ogw_front/components/ObjectSelector"

import { useGeodeStore } from "@ogw_front/stores/geode"

import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"

const allowed_objects = schemas.opengeodeweb_back.allowed_objects

const vuetify = createVuetify({
  components,
  directives,
})

describe("ObjectSelector", async () => {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })
  setActivePinia(pinia)
  const geodeStore = useGeodeStore()
  geodeStore.base_url = ""

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
      props: { filenames: ["test.toto"] },
    })
    const v_card = wrapper.findComponent(components.VCard)
    const v_img = v_card.findComponent(components.VImg)
    expect(v_img.vm.src).toContain(`${geode_object_1}.svg`)
    expect(wrapper.emitted()).toHaveProperty("update_values")
    expect(wrapper.emitted().update_values).toHaveLength(1)
    expect(wrapper.emitted().update_values[0][0]).toEqual({
      geode_object_type: geode_object_1,
    })
    wrapper.unmount()
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
      props: { filenames: ["test.toto"] },
    })
    const v_card = wrapper.findComponent(components.VCard)
    const v_img = v_card.findComponent(components.VImg)
    expect(v_img.vm.src).toContain(`${geode_object_1}.svg`)
    await flushPromises()
    await v_card.trigger("click")
    await flushPromises()
    expect(wrapper.emitted()).toHaveProperty("update_values")
    console.log(
      "wrapper.emitted().update_values",
      wrapper.emitted().update_values,
    )
    expect(wrapper.emitted().update_values).toHaveLength(1)
    expect(wrapper.emitted().update_values[0][0]).toEqual({
      geode_object_type: geode_object_1,
    })
    wrapper.unmount()
  })

  test(`test object_priority when is_loadable scores equal`, async () => {
    var response = { allowed_objects: {} }
    const geode_object_1 = "BRep"
    const geode_object_2 = "EdgedCurve3D"
    response["allowed_objects"][geode_object_1] = {
      is_loadable: 1.0,
      object_priority: 2,
    }
    response["allowed_objects"][geode_object_2] = {
      is_loadable: 1.0,
      object_priority: 1,
    }
    registerEndpoint(allowed_objects.$id, {
      method: allowed_objects.methods[0],
      handler: () => response,
    })
    const wrapper = await mountSuspended(ObjectSelector, {
      global: {
        plugins: [vuetify, pinia],
      },
      props: { filenames: ["test.toto"] },
    })

    await flushPromises()
    expect(wrapper.emitted()).toHaveProperty("update_values")
    expect(wrapper.emitted().update_values).toHaveLength(1)
    expect(wrapper.emitted().update_values[0][0]).toEqual({
      geode_object_type: geode_object_1,
    })
    wrapper.unmount()
  })
})
