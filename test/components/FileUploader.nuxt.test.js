// @vitest-environment nuxt

import { describe, expect, test } from "vitest"
import { registerEndpoint, mountSuspended } from "@nuxt/test-utils/runtime"

import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

import FileUploader from "@/components/FileUploader.vue"

const vuetify = createVuetify({
  components,
  directives,
})

global.ResizeObserver = require("resize-observer-polyfill")

describe("FileUploader.vue", async () => {
  test(`BRep`, async () => {
    registerEndpoint("/upload", {
      method: "PUT",
      handler: () => ({
        extensions: ["1", "2", "3"],
      }),
    })
    const wrapper = await mountSuspended(FileUploader, {
      global: {
        plugins: [vuetify],
      },
      props: { multiple: false, accept: "*.txt", route: "/upload" },
    })
    const v_file_input = wrapper.findComponent(components.VFileInput)
    await v_file_input.trigger("click")
    // console.log(wrapper.emitted())
    // expect(wrapper.emitted().files_uploaded[0][0]).toEqual({
    //   files,
    // })
  })
})
