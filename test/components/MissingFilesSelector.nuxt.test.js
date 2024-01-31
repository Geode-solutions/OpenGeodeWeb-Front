// @vitest-environment nuxt

import { describe, expect, test } from "vitest"
import { registerEndpoint, mountSuspended } from "@nuxt/test-utils/runtime"
import { flushPromises } from "@vue/test-utils"

import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

import MissingFilesSelector from "@/components/MissingFilesSelector.vue"
import FileUploader from "@/components/FileUploader.vue"

import schema from "@/assets/schemas/MissingFilesSelector.json"

const vuetify = createVuetify({
  components,
  directives,
})

global.ResizeObserver = require("resize-observer-polyfill")

describe("MissingFilesSelector.vue", async () => {
  test(`Select file`, async () => {
    registerEndpoint(schema.$id, {
      method: schema.method,
      handler: () => ({
        has_missing_files: true,
        mandatory_files: ["fake_file.txt"],
        additional_files: ["fake_file_2.txt"],
      }),
    })
    const wrapper = await mountSuspended(MissingFilesSelector, {
      global: {
        plugins: [vuetify],
      },
      props: {
        multiple: false,
        input_geode_object: "BRep",
        filenames: ["fake_file.txt"],
        route: "/upload_file",
      },
    })

    const file_uploader = wrapper.findComponent(FileUploader)
    expect(file_uploader.exists()).toBe(true)

    const v_file_input = file_uploader.findComponent(components.VFileInput)
    await v_file_input.trigger("click")
    const files = [new File(["fake_file"], "fake_file.txt")]
    await v_file_input.setValue(files)
    await v_file_input.trigger("change")
    const v_btn = file_uploader.findComponent(components.VBtn)

    registerEndpoint("/upload_file", {
      method: "PUT",
      handler: () => ({}),
    })
    await v_btn.trigger("click")
    await flushPromises()
    expect(wrapper.emitted()).toHaveProperty("update_values")
    expect(wrapper.emitted().update_values).toHaveLength(1)
    expect(wrapper.emitted().update_values[0][0]).toEqual({
      additional_files: files,
    })
  })
})
