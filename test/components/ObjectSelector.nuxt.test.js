// @vitest-environment nuxt

import { describe, expect, vi, test } from "vitest"
import { mount } from "@vue/test-utils"
import ObjectSelector from "../../components/ObjectSelector.vue"
import Loading from "../../components/Loading.vue"

describe("ObjectSelector.vue", () => {
  test("Renders properly", async () => {
    const wrapper = mount(ObjectSelector, {
      props: { filenames: ["test.toto"], key: "test" },
    })
    wrapper.findComponent(Loading)
    expect(wrapper.find("v-card").exists()).toBe(true)
  })

  // test("Select geode_object", async () => {
  //   const wrapper = mount(ObjectSelector, {
  //     props: { filenames: ["test.toto"], key: "test" },
  //   })
  //   await wrapper.setData({ allowed_objects.value: ["BRep"] })
  //   expect(wrapper.find("v-card").exists()).toBeTruthy()

  //   await wrapper.find("v-card").trigger("click")
  //   expect(wrapper.emitted().update_values).toEqual({
  //     input_geode_object: "BRep",
  //   })
  // })
})
