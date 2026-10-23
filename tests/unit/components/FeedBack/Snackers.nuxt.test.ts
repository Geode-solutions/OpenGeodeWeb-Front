// Third party imports
import * as components from "vuetify/components";
import { describe, expect, test, vi } from "vitest";
import { mount } from "@vue/test-utils";

// Local imports
import { setupActivePinia, vuetify } from "@ogw_tests/utils";
import FeedBackSnackers from "@ogw_front/components/FeedBack/Snackers.vue";
import { useFeedbackStore } from "@ogw_front/stores/feedback";

vi.stubGlobal("visualViewport", new EventTarget());

function mountSnackers(pinia: ReturnType<typeof setupActivePinia>): ReturnType<typeof mount> {
  return mount(
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
  );
}

// The snackbar is teleported out of the wrapper: buttons are found as components
function findButton(
  wrapper: ReturnType<typeof mount>,
  testId: string,
): ReturnType<typeof wrapper.findComponent> | undefined {
  return wrapper
    .findAllComponents(components.VBtn)
    .find((button) => button.attributes("data-testid") === testId);
}

describe("feedback snackers", () => {
  test("delete feedback", async () => {
    const pinia = setupActivePinia();
    const feedbackStore = useFeedbackStore();
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
    });

    const wrapper = mountSnackers(pinia);

    expect(feedbackStore.feedbacks).toHaveLength(1);
    const v_btn = wrapper.findComponent(components.VBtn);
    await v_btn.trigger("click");
    expect(feedbackStore.feedbacks).toHaveLength(0);
  });

  test("no action button without action", () => {
    const pinia = setupActivePinia();
    useFeedbackStore().$patch({
      feedbacks: [{ id: "1", type: "warning", description: "test description" }],
    });

    const wrapper = mountSnackers(pinia);

    expect(findButton(wrapper, "feedbackCloseBtn")).toBeDefined();
    expect(findButton(wrapper, "feedbackActionBtn")).toBeUndefined();
  });

  test("action button runs the action then removes the feedback", async () => {
    const pinia = setupActivePinia();
    const feedbackStore = useFeedbackStore();
    const onClick = vi.fn<() => void>();
    feedbackStore.$patch({
      feedbacks: [
        {
          id: "1",
          type: "warning",
          description: "test description",
          action: { label: "Edit CRS", onClick },
        },
      ],
    });

    const wrapper = mountSnackers(pinia);
    await findButton(wrapper, "feedbackActionBtn")?.trigger("click");

    expect(onClick).toHaveBeenCalledExactlyOnceWith();
    expect(feedbackStore.feedbacks).toHaveLength(0);
  });
});
