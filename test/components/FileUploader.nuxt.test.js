import { describe, expect, test } from "vitest"
import { registerEndpoint, mountSuspended } from "@nuxt/test-utils/runtime"
import { flushPromises } from "@vue/test-utils"

import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"
import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"

import FileUploader from "@ogw_f/components/FileUploader.vue"

import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"

const upload_file_schema = schemas.opengeodeweb_back.upload_file

const vuetify = createVuetify({
  components,
  directives,
})

describe("FileUploader.vue", async () => {
  const pinia = createTestingPinia()
  setActivePinia(pinia)
  const geode_store = use_geode_store()
  geode_store.base_url = ""

  registerEndpoint(upload_file_schema.$id, {
    method: upload_file_schema.methods[0],
    handler: () => ({}),
  })
  registerEndpoint(upload_file_schema.$id, {
    method: upload_file_schema.methods[1],
    handler: () => ({}),
  })

  const files = [new File(["fake_file"], "fake_file.txt")]

  describe(`Upload file`, async () => {
    test(`prop auto_upload false`, async () => {
      const wrapper = await mountSuspended(FileUploader, {
        global: {
          plugins: [vuetify, pinia],
        },
        props: { multiple: false, accept: "*.txt" },
      })

      const v_file_input = wrapper.findComponent(components.VFileInput)
      await v_file_input.trigger("click")

      await v_file_input.setValue(files)
      await v_file_input.trigger("change")
      const v_btn = wrapper.findComponent(components.VBtn)

      await v_btn.trigger("click")
      await flushPromises()
      await flushPromises()
      expect(wrapper.emitted().files_uploaded[0][0]).toEqual(files)
    })

    test(`prop auto_upload true`, async () => {
      const wrapper = await mountSuspended(FileUploader, {
        global: {
          plugins: [vuetify, pinia],
        },
        props: { multiple: false, accept: "*.txt", files, auto_upload: true },
      })
      await flushPromises()
      expect(wrapper.emitted().files_uploaded[0][0]).toEqual(files)
    })
  })
})
