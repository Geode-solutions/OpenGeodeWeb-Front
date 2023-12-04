// @vitest-environment nuxt

import { describe, expect, vi, test } from "vitest"
import { mount } from "@vue/test-utils"
import ObjectSelector from "@/components/ObjectSelector.vue"
import FetchingData from "@/components/FetchingData.vue"
import vuetify from "vite-plugin-vuetify"

describe("ObjectSelector.vue", () => {
  test("Renders properly", async () => {
    const wrapper = mount(ObjectSelector, {
      props: { filenames: ["test.toto"], key: "test" },
      global: {
        plugins: [vuetify()],
      },
    })
    wrapper.findComponent(FetchingData)
    expect(wrapper.find("v-card").exists()).toBe(true)
  })

  // test("Select geode_object", async () => {
  //   const wrapper = mount(ObjectSelector, {
  //     props: { filenames: ["test.toto"], key: "test" },
  //     global: {
  //       plugins: [vuetify],
  //     },
  //   })

  //   await wrapper.find("v-card").trigger("click")
  //   expect(wrapper.emitted().update_values).toEqual({
  //     input_geode_object: "BRep",
  //   })
  // })
})
