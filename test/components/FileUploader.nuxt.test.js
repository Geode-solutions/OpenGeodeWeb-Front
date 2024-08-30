// @vitest-environment nuxt

import { describe, expect, test } from "vitest"
import { registerEndpoint, mountSuspended } from "@nuxt/test-utils/runtime"
import { flushPromises } from "@vue/test-utils"

import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"
import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"

import FileUploader from "@/components/FileUploader.vue"

import schemas from "@geode/opengeodeweb-back/schemas.json"

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

  test(`Upload file`, async () => {
    registerEndpoint(upload_file_schema.$id, {
      method: upload_file_schema.methods[0],
      handler: () => ({}),
    })
    const wrapper = await mountSuspended(FileUploader, {
      global: {
        plugins: [vuetify, pinia],
      },
      props: { multiple: false, accept: "*.txt" },
    })
    const v_file_input = wrapper.findComponent(components.VFileInput)
    await v_file_input.trigger("click")
    const files = [new File(["fake_file"], "fake_file.txt")]
    await v_file_input.setValue(files)
    await v_file_input.trigger("change")
    const v_btn = wrapper.findComponent(components.VBtn)

    registerEndpoint(upload_file_schema.$id, {
      method: upload_file_schema.methods[1],
      handler: () => ({}),
    })

    await v_btn.trigger("click")
    await flushPromises()
    expect(wrapper.emitted().files_uploaded[0][0]).toEqual(files)
  })
})
