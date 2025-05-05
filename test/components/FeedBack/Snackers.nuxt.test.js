import { describe, expect, test } from "vitest"
import { mount } from "@vue/test-utils"
import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"
import { createTestingPinia } from "@pinia/testing"

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
          plugins: [
            createTestingPinia({
              initialState: {
                feedback: {
                  feedbacks: [
                    {
                      type: "error",
                      code: 500,
                      route: "/test",
                      name: "test message",
                      description: "test description",
                    },
                  ],
                },
              },
              stubActions: false,
            }),
            vuetify,
          ],
        },
      },
    )
    const feedback_store = use_feedback_store()
    expect(feedback_store.feedbacks.length).toBe(1)
    const v_btn = await wrapper.findComponent(components.VBtn)
    await v_btn.trigger("click")
    expect(feedback_store.feedbacks.length).toBe(0)
  })
})
