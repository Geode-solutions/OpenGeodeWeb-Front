// Third party imports
import * as components from "vuetify/components"
import { describe, expect, test, vi } from "vitest"
import { mount } from "@vue/test-utils"

// Local imports
import { setupActivePinia, vuetify } from "../../../utils"
import FeedBackSnackers from "@ogw_front/components/FeedBack/Snackers"
import { useFeedbackStore } from "@ogw_front/stores/feedback"

vi.stubGlobal("visualViewport", new EventTarget())

describe(FeedBackSnackers, async () => {
  test(`Test delete error`, async () => {
    const pinia = setupActivePinia()
    const feedbackStore = useFeedbackStore()
    feedbackStore.$patch({
      feedbacks: [
        {
          type: "error",
          code: 500,
          route: "/test",
          name: "test message",
          description: "test description",
        },
      ],
    })

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
          plugins: [vuetify, pinia],
        },
      },
    )

    expect(feedbackStore.feedbacks.length).toBe(1)
    const v_btn = await wrapper.findComponent(components.VBtn)
    await v_btn.trigger("click")
    expect(feedbackStore.feedbacks.length).toBe(0)
  })
})
