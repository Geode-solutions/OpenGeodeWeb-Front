// Third party imports
import * as components from "vuetify/components"
import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
import { mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime"
import { describe, expect, test, vi } from "vitest"
import { nextTick } from "vue"

// Local imports
import { setupActivePinia, vuetify } from "../../utils"
import ExtensionSelector from "@ogw_front/components/ExtensionSelector"
import { useGeodeStore } from "@ogw_front/stores/geode"

const EXPECTED_LENGTH = 1
const FIRST_INDEX = 0
const SECOND_INDEX = 1

const schema = schemas.opengeodeweb_back.geode_objects_and_output_extensions

describe(ExtensionSelector, () => {
  const pinia = setupActivePinia()
  const geodeStore = useGeodeStore()

  beforeEach(() => {
    geodeStore.base_url = ""

    // Mock the request method to simulate API call
    geodeStore.request = vi.fn((schema, params, callbacks) => {
      const response = {
        geode_objects_and_output_extensions: {
          BRep: { msh: { is_saveable: true } },
        },
      }
      if (callbacks?.response_function) {
        callbacks.response_function(response)
      }
      return Promise.resolve(response)
    })
  })

  test(`Select geode_object & extension`, async () => {
    const output_geode_object = "BRep"
    const output_extension = "msh"

    registerEndpoint(schema.$id, {
      method: schema.methods[FIRST_INDEX],
      handler: () => ({
        geode_objects_and_output_extensions: {
          BRep: { msh: { is_saveable: true } },
        },
      }),
    })
    const wrapper = await mountSuspended(ExtensionSelector, {
      global: {
        plugins: [vuetify, pinia],
      },
      props: { geode_object_type: "BRep", filenames: ["test.toto"] },
    })
    await nextTick()
    expect(wrapper.exists()).toBeTruthy()
    const v_card = await wrapper.findAllComponents(components.VCard)
    await v_card[SECOND_INDEX].trigger("click")
    expect(wrapper.emitted()).toHaveProperty("update_values")
    expect(wrapper.emitted().update_values).toHaveLength(EXPECTED_LENGTH)
    expect(
      wrapper.emitted().update_values[FIRST_INDEX][FIRST_INDEX],
    ).toStrictEqual({
      output_geode_object,
      output_extension,
    })
  })
})
