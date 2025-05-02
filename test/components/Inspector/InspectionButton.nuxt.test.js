// @vitest-environment nuxt

import { describe, expect, test } from "vitest"
import { registerEndpoint, mountSuspended } from "@nuxt/test-utils/runtime"
import { flushPromises } from "@vue/test-utils"

import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"
import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"

import InspectorInspectionButton from "@/components/Inspector/InspectionButton.vue"
import schemas from "@geode/opengeodeweb-back/schemas.json"
const schema = schemas.opengeodeweb_back.inspect_file

const vuetify = createVuetify({
  components,
  directives,
})

describe("Inspector/InspectionButton.vue", async () => {
  const pinia = createTestingPinia()
  setActivePinia(pinia)
  const geode_store = use_geode_store()
  geode_store.base_url = ""

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

    registerEndpoint(schema.$id, {
      method: schema.methods[0],
      handler: () => ({
        inspection_result,
      }),
    })
    const input_geode_object = "BRep"
    const filename = "test.txt"

    const wrapper = await mountSuspended(InspectorInspectionButton, {
      global: {
        plugins: [vuetify, pinia],
      },
      props: { input_geode_object, filename },
    })

    expect(wrapper.exists()).toBe(true)
    const v_btn = await wrapper.findComponent(components.VBtn)
    await v_btn.trigger("click")
    await flushPromises()

    expect(wrapper.emitted()).toHaveProperty("update_values")
    expect(wrapper.emitted().update_values).toHaveLength(1)
    expect(wrapper.emitted().update_values).toStrictEqual({
      inspection_result: [inspection_result],
    })
    expect(wrapper.emitted()).toHaveProperty("increment_step")
  })
})
