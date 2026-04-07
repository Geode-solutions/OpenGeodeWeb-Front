// Third party imports
import { mount } from "@vue/test-utils";

// Local imports
import { setupActivePinia, vuetify } from "@ogw_tests/utils";
import FeedBackErrorBanner from "@ogw_front/components/FeedBack/ErrorBanner";
import { useFeedbackStore } from "@ogw_front/stores/feedback";

const CALLED_TIMES = 1;

describe(FeedBackErrorBanner, () => {
  const pinia = setupActivePinia();
  test(`Test reload`, async () => {
    const wrapper = mount(FeedBackErrorBanner, {
      global: {
        plugins: [vuetify, pinia],
      },
    });
    const reload_spy = vi.spyOn(wrapper.vm, "reload");
    const feedbackStore = useFeedbackStore();
    await feedbackStore.$patch({ server_error: true });
    expect(feedbackStore.server_error).toBe(true);
    const v_btn = wrapper.findAll(".v-btn");
    await v_btn[0].trigger("click");
    expect(reload_spy).toHaveBeenCalledTimes(CALLED_TIMES);
  });

  test(`Test delete error`, async () => {
    const wrapper = mount(FeedBackErrorBanner, {
      global: {
        plugins: [vuetify, pinia],
      },
    });
    const feedbackStore = useFeedbackStore();
    const v_btn = wrapper.findAll(".v-btn");
    await v_btn[1].trigger("click");
    expect(feedbackStore.server_error).toBe(false);
  });
});
