import { describe, expect, test, vi } from "vitest"
import { registerEndpoint, mountSuspended } from "@nuxt/test-utils/runtime"
import { flushPromises } from "@vue/test-utils"

import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"
import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"

import MissingFilesSelector from "@ogw_front/components/MissingFilesSelector.vue"
import FileUploader from "@ogw_front/components/FileUploader.vue"

import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"

const missing_files_schema = schemas.opengeodeweb_back.missing_files
const upload_file_schema = schemas.opengeodeweb_back.upload_file

const vuetify = createVuetify({
  components,
  directives,
})

describe("MissingFilesSelector.vue", async () => {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })
  setActivePinia(pinia)
  const geode_store = useGeodeStore()
  geode_store.base_url = ""

  test(`Select file`, async () => {
    registerEndpoint(missing_files_schema.$id, {
      method: missing_files_schema.methods[0],
      handler: () => ({
        has_missing_files: true,
        mandatory_files: ["fake_file.txt"],
        additional_files: ["fake_file_2.txt"],
      }),
    })
    const wrapper = await mountSuspended(MissingFilesSelector, {
      global: {
        plugins: [vuetify, pinia],
      },
      props: {
        multiple: false,
        input_geode_object: "BRep",
        filenames: ["fake_file.txt"],
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

    registerEndpoint(upload_file_schema.$id, {
      method: upload_file_schema.methods[1],
      handler: () => ({}),
    })
    await v_btn.trigger("click")
    await flushPromises()
    await flushPromises()
    expect(wrapper.emitted()).toHaveProperty("update_values")
    expect(wrapper.emitted().update_values).toHaveLength(1)
    expect(wrapper.emitted().update_values[0][0]).toEqual({
      additional_files: files,
    })
    expect(wrapper.emitted().increment_step).toHaveLength(1)
  })
})
