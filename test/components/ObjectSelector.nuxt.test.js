// @vitest-environment nuxt

import { describe, expect, vi, test } from "vitest"
import { mount } from "@vue/test-utils"
import ObjectSelector from "../../components/ObjectSelector.vue"
import { vuetify } from "@/plugins/vuetify"

describe("ObjectSelector", () => {
  test("Renders properly", async () => {
    const wrapper = mount(ObjectSelector, {
      global: {
        plugins: [vuetify],
      },
      props: { files: ["test.toto"], key: "test" },
    })
    expect(wrapper.html()).toMatchSnapshot()
    expect(wrapper.find("v-card").exists()).toBeTruthy()
  })
  // test("Select", async () => {
  //   const wrapper = mount(ObjectSelector)
  //   wrapper.setData({ allowed_objects: ["BRep"] })
  //   expect(wrapper.find("v-card").exists()).toBeTruthy()

  //   await wrapper.find("v-card").trigger("click")
  //   expect(wrapper.emitted().update_values).toEqual({
  //     input_geode_object: "BRep",
  //   })
  // })
})
