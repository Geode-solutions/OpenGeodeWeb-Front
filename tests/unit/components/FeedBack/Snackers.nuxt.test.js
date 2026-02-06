// @vitest-environment nuxt
import * as components from "vuetify/components"
import { describe, expect, test, vi } from "vitest"
import { createTestingPinia } from "@pinia/testing"
import { mount } from "@vue/test-utils"
import { setActivePinia } from "pinia"

import FeedBackSnackers from "@ogw_front/components/FeedBack/Snackers"
import { useFeedbackStore } from "@ogw_front/stores/feedback"
import { vuetify } from "../../../utils"

vi.stubGlobal("visualViewport", new EventTarget())

describe("FeedBackSnackers", async () => {
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
