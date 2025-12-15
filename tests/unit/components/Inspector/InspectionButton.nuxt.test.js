import { describe, expect, test, vi } from "vitest"
import { registerEndpoint, mountSuspended } from "@nuxt/test-utils/runtime"
import { flushPromises } from "@vue/test-utils"

import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"
import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"

import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
import InspectorInspectionButton from "@ogw_front/components/Inspector/InspectionButton"
import { useGeodeStore } from "@ogw_front/stores/geode"
const schema = schemas.opengeodeweb_back.inspect_file

const vuetify = createVuetify({
  components,
  directives,
})

describe("Inspector/InspectionButton", async () => {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })
  setActivePinia(pinia)
  const geodeStore = useGeodeStore()
  geodeStore.base_url = ""

  test(`Test with issues`, async () => {
    var inspection_result = {
      title: "Brep inspection",
      nb_issues: 3,
      children: [
        {
          title: "Brep inspection",
          nb_issues: 2,
          issues: ["issue 1", "issue 2"],
        },
        {
          title: "Brep inspection",
          nb_issues: 1,
          issues: ["issue 1"],
        },
      ],
    }

    geodeStore.request = vi.fn((schema, params, callbacks) => {
      if (callbacks?.response_function) {
        callbacks.response_function({
          _data: { inspection_result },
        })
      }
      return Promise.resolve({
        _data: { inspection_result },
      })
    })

    const geode_object_type = "BRep"
    const filename = "test.txt"

    const wrapper = await mountSuspended(InspectorInspectionButton, {
      global: {
        plugins: [vuetify, pinia],
      },
      props: { geode_object_type, filename },
    })

    expect(wrapper.exists()).toBe(true)
    const v_btn = await wrapper.findComponent(components.VBtn)
    await v_btn.trigger("click")
    await flushPromises()

    expect(wrapper.emitted()).toHaveProperty("update_values")
    expect(wrapper.emitted().update_values).toHaveLength(1)
    expect(wrapper.emitted().update_values[0][0]).toStrictEqual({
      inspection_result: [inspection_result],
    })
    expect(wrapper.emitted()).toHaveProperty("increment_step")
  })
})
