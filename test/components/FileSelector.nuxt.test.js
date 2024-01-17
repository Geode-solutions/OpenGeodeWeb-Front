// @vitest-environment nuxt

import { describe, expect, test } from "vitest"
import { registerEndpoint, mountSuspended } from "@nuxt/test-utils/runtime"

import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

import FileSelector from "@/components/FileSelector.vue"
import schema from "@/assets/schemas/FileSelector.json"

const vuetify = createVuetify({
  components,
  directives,
})

global.ResizeObserver = require("resize-observer-polyfill")

describe("FileSelector.vue", async () => {
  test(`BRep`, async () => {
    registerEndpoint(schema.$id, {
      method: schema.method,
      handler: () => ({
        extensions: ["1", "2", "3"],
      }),
    })
    const wrapper = await mountSuspended(FileSelector, {
      global: {
        plugins: [vuetify],
      },
      props: { multiple: false, key: "test", route: "/upload" },
    })

    await wrapper.setData({ files: [FileReader()] })
    // const td = await wrapper.find("td")
    // const imput = await td.find("input")
    // await imput.trigger("click")
    // expect(wrapper.emitted()).toHaveProperty("update_values")
    // expect(wrapper.emitted().update_values).toHaveLength(1)
    // expect(wrapper.emitted().update_values[0][0]).toEqual({
    //   [key_to_update]: crs_list[0],
    // })
  })
})
