// Third party imports
import * as components from "vuetify/components"
import { describe, expect, test, vi } from "vitest"
import { mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime"
import { flushPromises } from "@vue/test-utils"
import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"

// Local imports
import { setupActivePinia, vuetify } from "../../utils"
import FileUploader from "@ogw_front/components/FileUploader"
import MissingFilesSelector from "@ogw_front/components/MissingFilesSelector"
import { useGeodeStore } from "@ogw_front/stores/geode"

const EXPECTED_LENGTH = 1
const FIRST_INDEX = 0
const SECOND_INDEX = 1

const upload_file_schema = schemas.opengeodeweb_back.upload_file

describe(MissingFilesSelector, () => {
  const pinia = setupActivePinia()
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
    expect(file_uploader.exists()).toBeTruthy()

    const v_file_input = file_uploader.find('input[type="file"]')
    const files = [new File(["fake_file"], "fake_file.txt")]
    Object.defineProperty(v_file_input.element, "files", {
      value: files,
      writable: true,
    })
    await v_file_input.trigger("change")
    const v_btn = file_uploader.findComponent(components.VBtn)

    registerEndpoint(upload_file_schema.$id, {
      method: upload_file_schema.methods[SECOND_INDEX],
      handler: () => ({}),
    })
    await v_btn.trigger("click")
    await flushPromises()
    await flushPromises()
    expect(wrapper.emitted()).toHaveProperty("update_values")
    expect(wrapper.emitted().update_values).toHaveLength(EXPECTED_LENGTH)
    expect(wrapper.emitted().update_values[FIRST_INDEX][FIRST_INDEX]).toEqual({
      additional_files: files,
    })
    expect(wrapper.emitted().increment_step).toHaveLength(EXPECTED_LENGTH)
  })
})
