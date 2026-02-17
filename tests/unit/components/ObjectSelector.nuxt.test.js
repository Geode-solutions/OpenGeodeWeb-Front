import * as components from "vuetify/components"
import { describe, expect, test } from "vitest"
import { mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime"
import { flushPromises } from "@vue/test-utils"

import { setupActivePinia, vuetify } from "../../utils"
import ObjectSelector from "@ogw_front/components/ObjectSelector"
import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
import { useGeodeStore } from "@ogw_front/stores/geode"

const EXPECTED_LENGTH = 1
const FIRST_INDEX = 0
const LOADABLE_SCORE = 1
const PRIORITY_1 = 1
const PRIORITY_2 = 2

const { allowed_objects } = schemas.opengeodeweb_back

describe(ObjectSelector, () => {
  const pinia = setupActivePinia()
  const geodeStore = useGeodeStore()
  geodeStore.base_url = ""

  test(`test loadable with one class`, async () => {
    const response = {
      allowed_objects: {},
    }
    const geode_object_1 = "BRep"
    response["allowed_objects"][geode_object_1] = { is_loadable: true }
    registerEndpoint(allowed_objects.$id, {
      method: allowed_objects.methods[FIRST_INDEX],
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
    expect(wrapper.emitted().update_values).toHaveLength(EXPECTED_LENGTH)
    expect(wrapper.emitted().update_values[FIRST_INDEX][FIRST_INDEX]).toEqual({
      geode_object_type: geode_object_1,
    })
    wrapper.unmount()
  })

  test(`test loabable with multiple classes`, async () => {
    const response = {
      allowed_objects: {},
    }
    const geode_object_1 = "BRep"
    const geode_object_2 = "EdgedCurve3D"
    response["allowed_objects"][geode_object_1] = { is_loadable: true }
    response["allowed_objects"][geode_object_2] = { is_loadable: true }
    registerEndpoint(allowed_objects.$id, {
      method: allowed_objects.methods[FIRST_INDEX],
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
    expect(wrapper.emitted().update_values).toHaveLength(EXPECTED_LENGTH)
    expect(wrapper.emitted().update_values[FIRST_INDEX][FIRST_INDEX]).toEqual({
      geode_object_type: geode_object_1,
    })
    wrapper.unmount()
  })

  test(`test object_priority when is_loadable scores equal`, async () => {
    const response = { allowed_objects: {} }
    const geode_object_1 = "BRep"
    const geode_object_2 = "EdgedCurve3D"
    response["allowed_objects"][geode_object_1] = {
      is_loadable: LOADABLE_SCORE,
      object_priority: PRIORITY_2,
    }
    response["allowed_objects"][geode_object_2] = {
      is_loadable: LOADABLE_SCORE,
      object_priority: PRIORITY_1,
    }
    registerEndpoint(allowed_objects.$id, {
      method: allowed_objects.methods[FIRST_INDEX],
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
    expect(wrapper.emitted().update_values).toHaveLength(EXPECTED_LENGTH)
    expect(wrapper.emitted().update_values[FIRST_INDEX][FIRST_INDEX]).toEqual({
      geode_object_type: geode_object_1,
    })
    wrapper.unmount()
  })
})
