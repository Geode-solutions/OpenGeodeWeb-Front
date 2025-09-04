import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"
import { useFeedbackStore } from "@ogw_f/stores/feedback"
import { beforeEach, describe, expect, expectTypeOf, test, vi } from "vitest"

beforeEach(async () => {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })
  setActivePinia(pinia)
})

describe("Feedback Store", () => {
  describe("state", () => {
    test("initial state", () => {
      const feedback_store = useFeedbackStore()
      expectTypeOf(feedback_store.feedbacks).toEqualTypeOf([])
      expectTypeOf(feedback_store.server_error).toBeBoolean()
    })
  })
  describe("actions", () => {
    describe("add_error", () => {
      test("test add_error", () => {
        const feedback_store = useFeedbackStore()
        feedback_store.add_error(
          500,
          "/test",
          "test message",
          "test description",
        )
        expect(feedback_store.feedbacks.length).toBe(1)
        expect(feedback_store.feedbacks[0].type).toBe("error")
      })
    })

    describe("add_error", () => {
      test("test feedbacks_timeout", () => {
        const feedback_store = useFeedbackStore()
        feedback_store.feedbacks_timeout_miliseconds = 500
        feedback_store.add_error(
          500,
          "/test",
          "test message",
          "test description",
        )
        expect(feedback_store.feedbacks.length).toBe(1)
        setTimeout(() => {
          expect(feedback_store.feedbacks.length).toBe(0)
        }, 1000)
      })
    })

    describe("add_success", () => {
      test("test add_success", () => {
        const feedback_store = useFeedbackStore()
        feedback_store.feedbacks_timeout_miliseconds = 500
        feedback_store.add_success("test description")
        expect(feedback_store.feedbacks.length).toBe(1)
        expect(feedback_store.feedbacks[0].type).toBe("success")

        setTimeout(() => {
          expect(feedback_store.feedbacks.length).toBe(0)
        }, 1000)
      })
    })
    describe("delete_feedback", () => {
      test("test", () => {
        const feedback_store = useFeedbackStore()
        feedback_store.delete_feedback(0)
        expect(feedback_store.feedbacks.length).toBe(0)
      })
    })

    describe("delete_server_error", () => {
      test("test", () => {
        const feedback_store = useFeedbackStore()
        feedback_store.$patch({ server_error: true })
        feedback_store.delete_server_error()
        expect(feedback_store.server_error).toBe(false)
      })
    })
  })
})
