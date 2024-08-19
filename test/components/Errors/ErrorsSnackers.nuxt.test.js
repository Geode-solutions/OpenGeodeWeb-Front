// @vitest-environment nuxt

import { describe, expect, test } from "vitest"
import { mount } from "@vue/test-utils"
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
    const wrapper = mount(
      {
        template: "<v-layout><ErrorsSnackers/></v-layout>",
      },
      {
        props: {},
        global: {
          components: {
            ErrorsSnackers,
          },
          plugins: [vuetify],
        },
      },
    )


    console.log("wrapper", wrapper)

    const feedback_store = use_feedback_store()
    const error = {
      type: "error",
      code: 404,
      route: "/test",
      name: "Test message",
      description: "Test desription",
    }
    await feedback_store.add_feedback(error)
    expect(feedback_store.feedbacks.length).toBe(1)
    const v_btn = await wrapper.findComponent(components.VBtn)
    console.log("v_btn", v_btn)
    await v_btn.trigger("click")
    expect(feedback_store.feedbacks.length).toBe(0)
  })
})
