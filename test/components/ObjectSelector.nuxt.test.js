// @vitest-environment nuxt

import { describe, expect, test } from "vitest"
import { mount } from "@vue/test-utils"
import ObjectSelector from "@/components/ObjectSelector.vue"
import FetchingData from "@/components/FetchingData.vue"
import vuetify from "vite-plugin-vuetify"

describe("ObjectSelector.vue", () => {
  test("Renders properly", async () => {
    const wrapper = mount(ObjectSelector, {
      global: {
        plugins: [vuetify],
      },
      props: { filenames: ["test.toto"], key: "test" },
    })
    wrapper.findComponent(FetchingData)
    expect(wrapper.find("v-card").exists()).toBe(true)
  })

  test("Select geode_object", async () => {
    const wrapper = mount(ObjectSelector, {
      global: {
        plugins: [vuetify],
      },
      props: { filenames: ["test.toto"], key: "test" },
    })

    // wrapper.setData({ allowed_objects: ["BRep", "Structural"] })
  })
  //   await wrapper.find("v-card").trigger("click")
  //   expect(wrapper.emitted().update_values).toEqual({
  //     input_geode_object: "BRep",
  //   })
  // })
})
