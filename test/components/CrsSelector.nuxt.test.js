// @vitest-environment nuxt

import { describe, expect, test } from "vitest"
import { registerEndpoint, mountSuspended } from "@nuxt/test-utils/runtime"

import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"
import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

import CrsSelector from "@/components/CrsSelector.vue"
import schemas from "@geode/opengeodeweb-back/schemas.json"

const crs_selector_schema =
  schemas.opengeodeweb_back.geographic_coordinate_systems

const vuetify = createVuetify({
  components,
  directives,
})

describe("CrsSelector.vue", async () => {
  const pinia = createTestingPinia()
  setActivePinia(pinia)
  const geode_store = use_geode_store()
  geode_store.base_url = ""

  test(`Default behavior`, async () => {
    const crs_list = [
      {
        authority: "EPSG",
        code: "2000",
        name: "Anguilla 1957 / British West Indies Grid",
      },
    ]
    registerEndpoint(crs_selector_schema.$id, {
      method: crs_selector_schema.methods.filter((m) => m !== "OPTIONS")[0],
      handler: () => ({
        crs_list,
      }),
    })
    const key_to_update = "key"
    const wrapper = await mountSuspended(CrsSelector, {
      global: {
        plugins: [vuetify, pinia],
      },
      props: { input_geode_object: "BRep", key_to_update },
    })
    const td = await wrapper.find("td")
    await wrapper.vm.$nextTick()
    const input = await td.find("input")
    await input.trigger("click")
    expect(wrapper.emitted()).toHaveProperty("update_values")
    expect(wrapper.emitted().update_values).toHaveLength(1)
    expect(wrapper.emitted().update_values[0][0]).toEqual({
      [key_to_update]: crs_list[0],
    })
  })
})
