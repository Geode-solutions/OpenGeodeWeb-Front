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
    const crs_list = [
      {
        authority: "EPSG",
        code: "2000",
        name: "Anguilla 1957 / British West Indies Grid",
      },
    ]
    registerEndpoint(schema.$id, {
      method: schema.method,
      handler: () => ({
        crs_list,
      }),
    })
    const key_to_update = "key"
    const wrapper = await mountSuspended(CrsSelector, {
      global: {
        plugins: [vuetify],
      },
      props: { input_geode_object: "BRep", key_to_update },
    })
    const td = await wrapper.find("td")
    console.log("td", td)

    await td.trigger("click")
    expect(wrapper.emitted()).toHaveProperty("update_values")
    expect(wrapper.emitted().update_values).toHaveLength(1)
    expect(wrapper.emitted().update_values[0][0]).toEqual({
      [key]: crs_list,
    })
  })
})
// }
