import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from "vitest";

// Local imports
import { setupActivePinia } from "@ogw_tests/utils";
import { useFeedbackStore } from "@ogw_front/stores/feedback";

const ERROR_500 = 500;

function assertIsDefined<Value>(value: Value | undefined): asserts value is Value {
  if (value === undefined) {
    throw new Error("Expected value to be defined");
  }
}

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
      test("add_error", () => {
        const feedbackStore = useFeedbackStore();
        feedbackStore.add_error(ERROR_500, "/test", "test message", "test description");
        expect(feedbackStore.feedbacks).toHaveLength(1);
        const [feedback] = feedbackStore.feedbacks;
        assertIsDefined(feedback);
        expect(feedback.type).toBe("error");
      });

      test("feedbacks_timeout", () => {
        const feedbackStore = useFeedbackStore();
        feedbackStore.feedbacks_timeout_miliseconds = 500;
        feedbackStore.add_error(ERROR_500, "/test", "test message", "test description");
        expect(feedbackStore.feedbacks).toHaveLength(1);
        vi.runAllTimers();
        expect(feedbackStore.feedbacks).toHaveLength(0);
      });
    });

    describe("add_success", () => {
      test("add_success", () => {
        const feedbackStore = useFeedbackStore();
        feedbackStore.feedbacks_timeout_miliseconds = 500;
        feedbackStore.add_success("test description");
        expect(feedbackStore.feedbacks).toHaveLength(1);
        const [feedback] = feedbackStore.feedbacks;
        assertIsDefined(feedback);
        expect(feedback.type).toBe("success");
        vi.runAllTimers();
        expect(feedbackStore.feedbacks).toHaveLength(0);
      });
    });

    describe("add_warning", () => {
      test("add_warning", () => {
        const feedbackStore = useFeedbackStore();
        feedbackStore.feedbacks_timeout_miliseconds = 500;
        feedbackStore.add_warning("test warning description");
        expect(feedbackStore.feedbacks).toHaveLength(1);
        const [feedback] = feedbackStore.feedbacks;
        assertIsDefined(feedback);
        expect(feedback.type).toBe("warning");
        vi.runAllTimers();
        expect(feedbackStore.feedbacks).toHaveLength(0);
      });
    });

    describe("delete_feedback", () => {
      test("delete_feedback", () => {
        const feedbackStore = useFeedbackStore();
        feedbackStore.add_success("test description");
        expect(feedbackStore.feedbacks).toHaveLength(1);
        const [feedback] = feedbackStore.feedbacks;
        assertIsDefined(feedback);
        feedbackStore.delete_feedback(feedback.id);
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
