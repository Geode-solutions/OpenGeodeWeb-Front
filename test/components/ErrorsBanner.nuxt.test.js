// @vitest-environment nuxt

import { describe, expect, test } from "vitest"
import { mount } from "@vue/test-utils"
import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

import ErrorsBanner from "@/components/Errors/Banner.vue"

const vuetify = createVuetify({
  components,
  directives,
})

describe("ObjectSelector.vue", async () => {
  test(`BRep`, async () => {
    const wrapper = await mount(ErrorsBanner, {
      global: {
        plugins: [vuetify],
      },
    })

    const errors_store = use_errors_store()
    const error = {
      code: 404,
      route: "/test",
      name: "Test message",
      description: "Test desription",
    }
    console.log("wrapper", wrapper)

    await errors_store.add_error(error)
    expect(errors_store.errors.length).toBe(1)
    const v_btn = wrapper.findComponent(components.VBtn)
    console.log("v_btn", v_btn)
    await v_btn.trigger("click")
    expect(errors_store.errors.length).toBe(0)
  })
})
