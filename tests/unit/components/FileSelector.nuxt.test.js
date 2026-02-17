// Third party imports
import * as components from "vuetify/components"
import { describe, expect, test, vi } from "vitest"
import { mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime"
import { flushPromises } from "@vue/test-utils"
import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"

// Local imports
import { setupActivePinia, vuetify } from "../../utils"
import FileSelector from "@ogw_front/components/FileSelector"
import FileUploader from "@ogw_front/components/FileUploader"
import { useGeodeStore } from "@ogw_front/stores/geode"

const EXPECTED_LENGTH = 1
const FIRST_INDEX = 0
const SECOND_INDEX = 1

const allowed_files_schema = schemas.opengeodeweb_back.allowed_files
const upload_file_schema = schemas.opengeodeweb_back.upload_file

describe(FileSelector, async () => {
  const pinia = setupActivePinia()
  const geodeStore = useGeodeStore()
  geodeStore.base_url = ""

  test(`Select file`, async () => {
    registerEndpoint(allowed_files_schema.$id, {
      method: allowed_files_schema.methods[FIRST_INDEX],
      handler: () => ({
        extensions: ["1", "2", "3"],
      }),
    })
    const wrapper = await mountSuspended(FileSelector, {
      global: {
        plugins: [vuetify, pinia],
      },
      props: { multiple: false, auto_upload: false },
    })

    const file_uploader = wrapper.findComponent(FileUploader)

    registerEndpoint(upload_file_schema.$id, {
      method: upload_file_schema.methods[SECOND_INDEX],
      handler: () => ({}),
    })

    const v_file_input = file_uploader.find('input[type="file"]')
    const files = [new File(["fake_file"], "fake_file.txt")]
    const auto_upload = false
    Object.defineProperty(v_file_input.element, "files", {
      value: files,
      writable: true,
    })
    await v_file_input.trigger("change")
    const v_btn = wrapper.findComponent(components.VBtn)
    await v_btn.trigger("click")
    await flushPromises()
    await flushPromises()
    expect(wrapper.emitted()).toHaveProperty("update_values")
    expect(wrapper.emitted().update_values).toHaveLength(EXPECTED_LENGTH)
    expect(wrapper.emitted().update_values[FIRST_INDEX][FIRST_INDEX]).toEqual({
      files,
      auto_upload,
    })
  })

  describe(FileSelector, () => {
    registerEndpoint(allowed_files_schema.$id, {
      method: allowed_files_schema.methods[FIRST_INDEX],
      handler: () => ({
        extensions: ["1", "2", "3"],
      }),
    })

    registerEndpoint(upload_file_schema.$id, {
      method: upload_file_schema.methods[SECOND_INDEX],
      handler: () => ({}),
    })

    const files = [new File(["fake_file"], "fake_file.txt")]
    test("auto_upload true", async () => {
      const wrapper = await mountSuspended(FileSelector, {
        global: {
          plugins: [vuetify, pinia],
        },
        props: {
          multiple: false,
          files: files,
          auto_upload: true,
        },
      })

      await flushPromises()
      expect(wrapper.componentVM.files).toEqual(files)
      expect(wrapper.emitted()).toHaveProperty("update_values")
      expect(wrapper.emitted().update_values).toHaveLength(EXPECTED_LENGTH)
      expect(wrapper.emitted().update_values[FIRST_INDEX][FIRST_INDEX]).toEqual(
        {
          files,
          auto_upload: false,
        },
      )
    })

    test("auto_upload false", async () => {
      const wrapper = await mountSuspended(FileSelector, {
        global: {
          plugins: [vuetify, pinia],
        },
        props: {
          multiple: false,
          files: files,
          auto_upload: false,
        },
      })

      await flushPromises()

      const file_uploader = wrapper.findComponent(FileUploader)
      expect(wrapper.vm.files).toEqual(files)
      const upload_files = vi.spyOn(file_uploader.vm, "upload_files")
      expect(upload_files).not.toHaveBeenCalled()
    })
  })
})
