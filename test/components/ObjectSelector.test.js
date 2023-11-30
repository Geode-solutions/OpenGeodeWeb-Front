/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it, vi } from "vitest"
import { mount } from "@vue/test-utils"
import Toto from "../../components/Toto.vue"

describe("ErrorBanner", () => {
  it("Renders properly", () => {
    const wrapper = mount(Toto)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
