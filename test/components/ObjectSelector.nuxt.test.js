// @vitest-environment nuxt

import { describe, expect, vi, test } from "vitest"
import { mount } from "@vue/test-utils"
import ObjectSelector from "../../components/ObjectSelector.vue"

vi.stubGlobal("api_fetch", () => ({
  pending: false,
  error: undefined,
  _data: { allowed_objects: ["Brep"] },
}))

describe("ObjectSelector", async () => {
  test("Renders properly", async () => {
    const wrapper = mount(ObjectSelector, { files: [], key: "test" })
    expect(wrapper.html()).toMatchSnapshot()
    expect(wrapper.find("v-card").exists()).toBeTruthy()
  }),
    test("Select", async () => {
      const wrapper = mount(ObjectSelector)

      expect(wrapper.find("v-card").exists()).toBeTruthy()

      await wrapper.find("v-card").trigger("click")
      expect(wrapper.emitted().update_values).toEqual({
        input_geode_object: "BRep",
      })
    })
})
