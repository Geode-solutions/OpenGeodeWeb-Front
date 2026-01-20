import { describe, expect, test, vi } from "vitest"
import { registerEndpoint, mountSuspended } from "@nuxt/test-utils/runtime"
import { flushPromises } from "@vue/test-utils"
import * as components from "vuetify/components"
import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"

import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"

import MissingFilesSelector from "@ogw_front/components/MissingFilesSelector"
import FileUploader from "@ogw_front/components/FileUploader"
import { useGeodeStore } from "@ogw_front/stores/geode"

import { vuetify } from "../../utils"

const missing_files_schema = schemas.opengeodeweb_back.missing_files
const upload_file_schema = schemas.opengeodeweb_back.upload_file

describe("MissingFilesSelector", async () => {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })
  setActivePinia(pinia)
  const geodeStore = useGeodeStore()
  geodeStore.base_url = ""

  test(`Select file`, async () => {
    geodeStore.request = vi.fn((schema, params, callbacks) => {
      if (callbacks?.response_function) {
        callbacks.response_function({
          has_missing_files: true,
          mandatory_files: ["fake_file.txt"],
          additional_files: ["fake_file_2.txt"],
        })
      }
      return Promise.resolve({
        has_missing_files: true,
        mandatory_files: ["fake_file.txt"],
        additional_files: ["fake_file_2.txt"],
      })
    })

    const wrapper = await mountSuspended(MissingFilesSelector, {
      global: {
        plugins: [vuetify, pinia],
      },
      props: {
        multiple: false,
        geode_object_type: "BRep",
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
