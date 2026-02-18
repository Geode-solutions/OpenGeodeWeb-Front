// Third party imports
import * as components from "vuetify/components"
import { describe, expect, test } from "vitest"
import { mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime"
import { flushPromises } from "@vue/test-utils"
import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"

// Local imports
import { setupActivePinia, vuetify } from "../../utils"
import FileUploader from "@ogw_front/components/FileUploader"
import { useGeodeStore } from "@ogw_front/stores/geode"

const FIRST_INDEX = 0
const SECOND_INDEX = 1

const upload_file_schema = schemas.opengeodeweb_back.upload_file

describe(FileUploader, async () => {
  const pinia = setupActivePinia()
  const geodeStore = useGeodeStore()
  geodeStore.base_url = ""

  registerEndpoint(upload_file_schema.$id, {
    method: upload_file_schema.methods[FIRST_INDEX],
    handler: () => ({}),
  })
  registerEndpoint(upload_file_schema.$id, {
    method: upload_file_schema.methods[SECOND_INDEX],
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

      const v_file_input = wrapper.find('input[type="file"]')
      Object.defineProperty(v_file_input.element, "files", {
        value: files,
        writable: true,
      })
      await v_file_input.trigger("change")
      const v_btn = wrapper.findComponent(components.VBtn)

      await v_btn.trigger("click")
      await flushPromises()
      await flushPromises()
      expect(
        wrapper.emitted().files_uploaded[FIRST_INDEX][FIRST_INDEX],
      ).toEqual(files)
    })

    test(`prop auto_upload true`, async () => {
      const wrapper = await mountSuspended(FileUploader, {
        global: {
          plugins: [vuetify, pinia],
        },
        props: { multiple: false, accept: "*.txt", files, auto_upload: true },
      })
      await flushPromises()
      expect(
        wrapper.emitted().files_uploaded[FIRST_INDEX][FIRST_INDEX],
      ).toEqual(files)
    })
  })
})
