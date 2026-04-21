import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from "vitest";

// Local imports
import { setupActivePinia } from "@ogw_tests/utils";
import { useFeedbackStore } from "@ogw_front/stores/feedback";

const ERROR_500 = 500;

describe("feedback store", () => {
  beforeEach(() => {
    setupActivePinia();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("state", () => {
    test("initial state", () => {
      const feedbackStore = useFeedbackStore();
      expectTypeOf(feedbackStore.feedbacks).toEqualTypeOf([]);
      expectTypeOf(feedbackStore.server_error).toBeBoolean();
    });
  });

  describe("actions", () => {
    describe("add_error", () => {
      test("add_error", async () => {
        const feedbackStore = useFeedbackStore();
        await feedbackStore.add_error(ERROR_500, "/test", "test message", "test description");
        expect(feedbackStore.feedbacks).toHaveLength(1);
        expect(feedbackStore.feedbacks[0].type).toBe("error");
      });

      test("feedbacks_timeout", async () => {
        const feedbackStore = useFeedbackStore();
        feedbackStore.feedbacks_timeout_miliseconds = 500;
        await feedbackStore.add_error(ERROR_500, "/test", "test message", "test description");
        expect(feedbackStore.feedbacks).toHaveLength(1);
        vi.runAllTimers();
        expect(feedbackStore.feedbacks).toHaveLength(0);
      });
    });

    describe("add_success", () => {
      test("add_success", async () => {
        const feedbackStore = useFeedbackStore();
        feedbackStore.feedbacks_timeout_miliseconds = 500;
        await feedbackStore.add_success("test description");
        expect(feedbackStore.feedbacks).toHaveLength(1);
        expect(feedbackStore.feedbacks[0].type).toBe("success");
        vi.runAllTimers();
        expect(feedbackStore.feedbacks).toHaveLength(0);
      });
    });

    describe("delete_feedback", () => {
      test("delete_feedback", async () => {
        const feedbackStore = useFeedbackStore();
        await feedbackStore.add_success("test description");
        expect(feedbackStore.feedbacks).toHaveLength(1);
        const feedbackId = feedbackStore.feedbacks[0].id;
        feedbackStore.delete_feedback(feedbackId);
        expect(feedbackStore.feedbacks).toHaveLength(0);
      });
    });

    describe("delete_server_error", () => {
      test("delete_server_error", () => {
        const feedbackStore = useFeedbackStore();
        feedbackStore.$patch({ server_error: true });
        feedbackStore.delete_server_error();
        expect(feedbackStore.server_error).toBe(false);
      });
    });
  });
});
