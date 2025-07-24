import { describe, expect, test } from "vitest"
import { registerEndpoint, mountSuspended } from "@nuxt/test-utils/runtime"

import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"
import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"

import ExtensionSelector from "@ogw_f/components/ExtensionSelector.vue"

import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"

const schema = schemas.opengeodeweb_back.geode_objects_and_output_extensions

const vuetify = createVuetify({
  components,
  directives,
})

describe("ExtensionSelector.vue", async () => {
  const pinia = createTestingPinia()
  setActivePinia(pinia)
  const geode_store = use_geode_store()
  geode_store.base_url = ""

  test(`Select geode_object & extension`, async () => {
    const output_geode_object = "BRep"
    const output_extension = "msh"

    registerEndpoint(schema.$id, {
      method: schema.methods[0],
      handler: () => ({
        geode_objects_and_output_extensions: {
          BRep: { msh: { is_saveable: true } },
        },
      }),
    })
    const wrapper = await mountSuspended(ExtensionSelector, {
      global: {
        plugins: [vuetify, pinia],
      },
      props: { input_geode_object: "BRep", filenames: ["test.toto"] },
    })
    await nextTick()
    expect(wrapper.exists()).toBe(true)
    const v_card = await wrapper.findAllComponents(components.VCard)
    await v_card[1].trigger("click")
    expect(wrapper.emitted()).toHaveProperty("update_values")
    expect(wrapper.emitted().update_values).toHaveLength(1)
    expect(wrapper.emitted().update_values[0][0]).toStrictEqual({
      output_geode_object,
      output_extension,
    })
  })
})
