// @vitest-environment nuxt

import { describe, expect, test } from "vitest"
import { mount } from "@vue/test-utils"
import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

import FeedBackSnackers from "@/components/FeedBack/Snackers.vue"

const vuetify = createVuetify({
  components,
  directives,
})

describe("FeedBackSnackers.vue", async () => {
  test(`Test delete error`, async () => {
    const wrapper = mount(
      {
        template: "<v-layout><FeedBackSnackers/></v-layout>",
      },
      {
        props: {},
        global: {
          components: {
            FeedBackSnackers,
          },
          plugins: [vuetify],
        },
      },
    )

    console.log("wrapper", wrapper)

    const feedback_store = use_feedback_store()
    await feedback_store.add_error(
      404,
      "/test",
      "Test message",
      "Test desription",
    )
    expect(feedback_store.feedbacks.length).toBe(1)
    const v_btn = await wrapper.findComponent(components.VBtn)
    console.log("v_btn", v_btn)
    await v_btn.trigger("click")
    expect(feedback_store.feedbacks.length).toBe(0)
  })
})
