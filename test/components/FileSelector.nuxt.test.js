// @vitest-environment nuxt

import { describe, expect, test, vi } from "vitest"
import { registerEndpoint, mountSuspended } from "@nuxt/test-utils/runtime"
import { flushPromises } from "@vue/test-utils"

import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"

import FileSelector from "@/components/FileSelector.vue"
import FileUploader from "@/components/FileUploader.vue"

import schemas from "@geode/opengeodeweb-back/schemas.json"

const allowed_files_schema = schemas.opengeodeweb_back.allowed_files
const upload_file_schema = schemas.opengeodeweb_back.upload_file

const vuetify = createVuetify({
  components,
  directives,
})

describe("FileSelector.vue", async () => {
  const pinia = createTestingPinia()
  setActivePinia(pinia)
  const geode_store = use_geode_store()
  geode_store.base_url = ""

  test(`Select file`, async () => {
    registerEndpoint(allowed_files_schema.$id, {
      method: allowed_files_schema.methods[0],
      handler: () => ({
        extensions: ["1", "2", "3"],
      }),
    })
    const wrapper = await mountSuspended(FileSelector, {
      global: {
        plugins: [vuetify, pinia],
      },
      props: { multiple: false, supported_feature: "test" },
    })

    const file_uploader = wrapper.findComponent(FileUploader)

    registerEndpoint(upload_file_schema.$id, {
      method: upload_file_schema.methods[1],
      handler: () => ({}),
    })

    const v_file_input = file_uploader.findComponent(components.VFileInput)
    await v_file_input.trigger("click")
    const files = [new File(["fake_file"], "fake_file.txt")]
    const auto_upload = false
    await v_file_input.setValue(files)
    await v_file_input.trigger("change")
    const v_btn = wrapper.findComponent(components.VBtn)
    await v_btn.trigger("click")
    await flushPromises()
    expect(wrapper.emitted()).toHaveProperty("update_values")
    expect(wrapper.emitted().update_values).toHaveLength(1)
    expect(wrapper.emitted().update_values[0][0]).toEqual({
      files,
      auto_upload,
    })
  })

  describe(`Files prop`, () => {
    registerEndpoint(allowed_files_schema.$id, {
      method: allowed_files_schema.methods[0],
      handler: () => ({
        extensions: ["1", "2", "3"],
      }),
    })

    registerEndpoint(upload_file_schema.$id, {
      method: upload_file_schema.methods[1],
      handler: () => ({}),
    })

    const files = [new File(["fake_file"], "fake_file.txt")]
    test("auto_upload true", async () => {
      const auto_upload = true
      const wrapper = await mountSuspended(FileSelector, {
        global: {
          plugins: [vuetify, pinia],
        },
        props: {
          multiple: false,
          supported_feature: "test",
          files: files,
          auto_upload,
        },
      })

      await flushPromises()
      expect(wrapper.componentVM.props.files).toEqual(files)
      expect(wrapper.emitted()).toHaveProperty("update_values")
      expect(wrapper.emitted().update_values).toHaveLength(1)
      expect(wrapper.emitted().update_values[0][0]).toEqual({
        files,
        auto_upload: false,
      })
    })

    test("auto_upload false", async () => {
      const auto_upload = false
      const wrapper = await mountSuspended(FileSelector, {
        global: {
          plugins: [vuetify, pinia],
        },
        props: {
          multiple: false,
          supported_feature: "test",
          files: files,
          auto_upload,
        },
      })

      await flushPromises()

      const file_uploader = wrapper.findComponent(FileUploader)
      console.log("wrapper", wrapper)
      expect(wrapper.vm.props.files).toEqual(files)
      const upload_files = vi.spyOn(file_uploader.vm, "upload_files")
      expect(upload_files).not.toHaveBeenCalled()
    })
  })
})
