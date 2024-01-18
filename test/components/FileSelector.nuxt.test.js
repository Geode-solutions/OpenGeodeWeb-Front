// @vitest-environment nuxt

import { describe, expect, test } from "vitest"
import { registerEndpoint, mountSuspended } from "@nuxt/test-utils/runtime"
import { flushPromises } from "@vue/test-utils"

import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

import FileSelector from "@/components/FileSelector.vue"
import FileUploader from "@/components/FileUploader.vue"
import schema from "@/assets/schemas/FileSelector.json"

const vuetify = createVuetify({
  components,
  directives,
})

global.ResizeObserver = require("resize-observer-polyfill")

describe("FileSelector.vue", async () => {
  test(`Select file`, async () => {
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

    const file_uploader = wrapper.findComponent(FileUploader)

    registerEndpoint("/upload", {
      method: "PUT",
      handler: () => ({}),
    })

    const v_file_input = file_uploader.findComponent(components.VFileInput)
    await v_file_input.trigger("click")
    const files = [new File(["fake_file"], "fake_file.txt")]
    await v_file_input.setValue(files)
    await v_file_input.trigger("change")
    const v_btn = wrapper.findComponent(components.VBtn)
    await v_btn.trigger("click")
    await flushPromises()
    expect(wrapper.emitted()).toHaveProperty("update_values")
    expect(wrapper.emitted().update_values).toHaveLength(1)
    expect(wrapper.emitted().update_values[0][0]).toEqual({
      files,
    })
  })
})
