// @vitest-environment nuxt

import { describe, expect, test } from "vitest"
import { flushPromises, mount } from "@vue/test-utils"
import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

import ErrorsSnackers from "@/components/Errors/Snackers.vue"

const vuetify = createVuetify({
  components,
  directives,
})

describe("ErrorsSnackers.vue", async () => {
  test(`Test delete error`, async () => {
    const wrapper = await mount(ErrorsSnackers, {
      global: {
        plugins: [vuetify],
      },
    })
    console.log("wrapper", wrapper.componentVM)

    const errors_store = use_errors_store()
    const error = {
      code: 404,
      route: "/test",
      name: "Test message",
      description: "Test desription",
    }
    await errors_store.add_error(error)
    await flushPromises()
    expect(errors_store.errors.length).toBe(1)
    console.log("errors_store.errors", errors_store.errors)
    const v_btn = await wrapper.findComponent(components.VBtn)
    console.log("v_btn", v_btn)

    await v_btn.trigger("click")
    expect(errors_store.errors.length).toBe(0)
  })
})
