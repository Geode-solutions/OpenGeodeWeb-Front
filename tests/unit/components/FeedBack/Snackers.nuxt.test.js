// @vitest-environment nuxt
vi.stubGlobal("visualViewport", new EventTarget())
import { describe, expect, test, vi } from "vitest"
import { mount } from "@vue/test-utils"
import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"

import FeedBackSnackers from "@ogw_front/components/FeedBack/Snackers.vue"
import { useFeedbackStore } from "@ogw_front/stores/feedback"

const vuetify = createVuetify({
  components,
  directives,
})

describe("FeedBackSnackers.vue", async () => {
  test(`Test delete error`, async () => {
    const pinia = createTestingPinia({
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
      createSpy: vi.fn,
    })
    setActivePinia(pinia)
    const feedbackStore = useFeedbackStore()
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
          plugins: [pinia, vuetify],
        },
      },
    )

    expect(feedbackStore.feedbacks.length).toBe(1)
    const v_btn = await wrapper.findComponent(components.VBtn)
    await v_btn.trigger("click")
    expect(feedbackStore.feedbacks.length).toBe(0)
  })
})
