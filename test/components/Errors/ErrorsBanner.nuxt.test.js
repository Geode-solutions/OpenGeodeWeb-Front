// @vitest-environment nuxt

import { describe, expect, test, vi } from "vitest"
import { mount } from "@vue/test-utils"
import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

import ErrorsBanner from "@/components/Errors/Banner.vue"

const vuetify = createVuetify({
  components,
  directives,
})

describe("ErrorsBanner.vue", async () => {
  test(`Test reload`, async () => {
    const wrapper = mount(ErrorsBanner, {
      global: {
        plugins: [vuetify],
      },
    })
    const reload_spy = vi.spyOn(wrapper.vm, "reload")
    const feedback_store = use_feedback_store()
    await feedback_store.$patch({ server_error: true })
    expect(feedback_store.server_error).toBe(true)
    const v_btn = wrapper.findAll(".v-btn")
    await v_btn[0].trigger("click")

    expect(reload_spy).toHaveBeenCalledTimes(1)
  }),
    test(`Test delete error`, async () => {
      const wrapper = mount(ErrorsBanner, {
        global: {
          plugins: [vuetify],
        },
      })

      const feedback_store = use_feedback_store()
      await feedback_store.$patch({ server_error: true })
      expect(feedback_store.server_error).toBe(true)
      const v_btn = wrapper.findAll(".v-btn")
      await v_btn[1].trigger("click")
      expect(feedback_store.server_error).toBe(false)
    })
})
