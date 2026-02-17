import { describe, expect, test, vi } from "vitest"

import { createTestingPinia } from "@pinia/testing"
import { mountSuspended } from "@nuxt/test-utils/runtime"
import { setActivePinia } from "pinia"

import CrsSelector from "@ogw_front/components/CrsSelector"
import { useGeodeStore } from "@ogw_front/stores/geode"

import { vuetify } from "../../utils"

const EXPECTED_LENGTH = 1
const FIRST_INDEX = 0

describe(CrsSelector, () => {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })
  setActivePinia(pinia)
  const geodeStore = useGeodeStore()
  geodeStore.base_url = ""

  test(`Default behavior`, async () => {
    const crs_list = [
      {
        authority: "EPSG",
        code: "2000",
        name: "Anguilla 1957 / British West Indies Grid",
      },
    ]

    // Mock geodeStore.request instead of registerEndpoint
    geodeStore.request = vi.fn((schema, params, callbacks) => {
      if (callbacks?.response_function) {
        callbacks.response_function({ crs_list })
      }
      return Promise.resolve({ crs_list })
    })

    const key_to_update = "key"
    const wrapper = await mountSuspended(CrsSelector, {
      global: {
        plugins: [vuetify, pinia],
      },
      props: { geode_object_type: "BRep", key_to_update },
    })
    const td_wrapper = await wrapper.find("td")
    await wrapper.vm.$nextTick()
    const input = await td_wrapper.find("input")
    await input.trigger("click")
    expect(wrapper.emitted()).toHaveProperty("update_values")
    expect(wrapper.emitted().update_values).toHaveLength(EXPECTED_LENGTH)
    expect(wrapper.emitted().update_values[FIRST_INDEX][FIRST_INDEX]).toEqual({
      [key_to_update]: crs_list[FIRST_INDEX],
    })
  })
})
