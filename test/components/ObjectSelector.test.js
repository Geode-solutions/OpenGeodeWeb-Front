// import { describe, it } from "vitest"
import { mount } from "@vue/test-utils"
import ErrorBanner from "../../components/Errors/Banner.vue"

describe("ObjectSelector", () => {
  it("Renders properly", () => {
    const wrapper = mount(ErrorBanner)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
