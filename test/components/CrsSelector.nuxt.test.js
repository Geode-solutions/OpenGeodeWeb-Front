// @vitest-environment nuxt

import { describe, expect, test } from "vitest"
import { registerEndpoint, mountSuspended } from "@nuxt/test-utils/runtime"

import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

import CrsSelector from "@/components/CrsSelector.vue"
import schema from "@/assets/schemas/CrsSelector.json"

const vuetify = createVuetify({
  components,
  directives,
})

global.ResizeObserver = require("resize-observer-polyfill")

describe("CrsSelector.vue", async () => {
  test(`BRep`, async () => {
    registerEndpoint(schema.$id, {
      method: schema.method,
      handler: () => ({
        crs_list: [
          {
            authority: "EPSG",
            code: "2000",
            name: "Anguilla 1957 / British West Indies Grid",
          },
        ],
      }),
    })
    const wrapper = await mountSuspended(CrsSelector, {
      global: {
        plugins: [vuetify],
      },
      props: { input_geode_object: "BRep", key_to_update: "crs" },
    })
    const v_data_table = await wrapper.findComponent(components.VDataTable)
    console.log("v_data_table", v_data_table)
    // console.log("v_data_table items", v_data_table._children)
    const input = await wrapper.find("input")
    console.log("input", input)

    const tr = v_data_table.find(".tr")
    console.log("tr", tr)

    const td = v_data_table.find(".td")
    console.log("td", td)
    await input.trigger("click")
    console.log("emitted", wrapper.emitted())
    // expect(wrapper.emitted()).toHaveProperty("update_values")
    expect(wrapper.emitted().update_values).toHaveLength(1)
    expect(wrapper.emitted().update_values[0][0]).toEqual({
      key_to_update: {
        crs: {
          authority: "EPSG",
          code: "2000",
          name: "Anguilla 1957 / British West Indies Grid",
        },
      },
    })
  })
})
