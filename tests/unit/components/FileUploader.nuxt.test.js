import * as components from "vuetify/components"
import { describe, expect, test, vi } from "vitest"
import { mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime"
import { flushPromises } from "@vue/test-utils"

import { createTestingPinia } from "@pinia/testing"
import { setActivePinia } from "pinia"

import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"

import FileUploader from "@ogw_front/components/FileUploader"
import { useGeodeStore } from "@ogw_front/stores/geode"

import { vuetify } from "../../utils"

const upload_file_schema = schemas.opengeodeweb_back.upload_file

describe("FileUploader", async () => {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })
  setActivePinia(pinia)
  const geodeStore = useGeodeStore()
  geodeStore.base_url = ""

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
