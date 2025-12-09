import { describe, expect, test, vi } from "vitest"
import { mount } from "@vue/test-utils"
import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"
import { createTestingPinia } from "@pinia/testing"
import { setActivePinia } from "pinia"

import FeedBackErrorBanner from "@ogw_front/components/FeedBack/ErrorBanner.vue"
import { useFeedbackStore } from "@ogw_front/stores/feedback"

const vuetify = createVuetify({
  components,
  directives,
})

describe("FeedBackErrorBanner.vue", async () => {
  test(`Test reload`, async () => {
    const pinia = createTestingPinia({
      stubActions: false,
      createSpy: vi.fn,
    })
    setActivePinia(pinia)
    const wrapper = mount(FeedBackErrorBanner, {
      global: {
        plugins: [pinia, vuetify],
      },
    })
    const reload_spy = vi.spyOn(wrapper.vm, "reload")
    const feedbackStore = useFeedbackStore()
    await feedbackStore.$patch({ server_error: true })
    expect(feedbackStore.server_error).toBe(true)
    const v_btn = wrapper.findAll(".v-btn")
    await v_btn[0].trigger("click")
    expect(reload_spy).toHaveBeenCalledTimes(1)
  }),
    test(`Test delete error`, async () => {
      const wrapper = mount(FeedBackErrorBanner, {
        global: {
          plugins: [
            createTestingPinia({
              initialState: {
                feedback: {
                  server_error: true,
                },
              },
              stubActions: false,
              createSpy: vi.fn,
            }),
            vuetify,
          ],
        },
      })

      const feedbackStore = useFeedbackStore()
      const v_btn = wrapper.findAll(".v-btn")
      await v_btn[1].trigger("click")
      expect(feedbackStore.server_error).toBe(false)
    })
})
