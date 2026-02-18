// Third party imports
import { beforeEach, describe, expect, expectTypeOf, test } from "vitest"

// Local imports
import { setupActivePinia } from "../../utils"
import { useFeedbackStore } from "@ogw_front/stores/feedback"

beforeEach(() => {
  setupActivePinia()
})

describe("Feedback Store", () => {
  describe("state", () => {
    test("initial state", () => {
      const feedbackStore = useFeedbackStore()
      expectTypeOf(feedbackStore.feedbacks).toEqualTypeOf([])
      expectTypeOf(feedbackStore.server_error).toBeBoolean()
    })
  })

  describe("actions", () => {
    describe("add_error", () => {
      test("test add_error", () => {
        const feedbackStore = useFeedbackStore()
        feedbackStore.add_error(
          500,
          "/test",
          "test message",
          "test description",
        )
        expect(feedbackStore.feedbacks).toHaveLength(1)
        expect(feedbackStore.feedbacks[0].type).toBe("error")
      })

      test("test feedbacks_timeout", () => {
        const feedbackStore = useFeedbackStore()
        feedbackStore.feedbacks_timeout_miliseconds = 500
        feedbackStore.add_error(
          500,
          "/test",
          "test message",
          "test description",
        )
        expect(feedbackStore.feedbacks).toHaveLength(1)
        setTimeout(() => {
          expect(feedbackStore.feedbacks).toHaveLength(0)
        }, 1000)
      })
    })

    describe("add_success", () => {
      test("test add_success", () => {
        const feedbackStore = useFeedbackStore()
        feedbackStore.feedbacks_timeout_miliseconds = 500
        feedbackStore.add_success("test description")
        expect(feedbackStore.feedbacks).toHaveLength(1)
        expect(feedbackStore.feedbacks[0].type).toBe("success")

        setTimeout(() => {
          expect(feedbackStore.feedbacks).toHaveLength(0)
        }, 1000)
      })
    })

    describe("delete_feedback", () => {
      test("test", () => {
        const feedbackStore = useFeedbackStore()
        feedbackStore.delete_feedback(0)
        expect(feedbackStore.feedbacks).toHaveLength(0)
      })
    })

    describe("delete_server_error", () => {
      test("test", () => {
        const feedbackStore = useFeedbackStore()
        feedbackStore.$patch({ server_error: true })
        feedbackStore.delete_server_error()
        expect(feedbackStore.server_error).toBeFalsy()
      })
    })
  })
})
