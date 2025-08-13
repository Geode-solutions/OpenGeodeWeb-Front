import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"
import { use_feedback_store } from "@ogw_f/stores/feedback"

describe("Feedback Store", () => {
  const pinia = createTestingPinia({
    stubActions: false,
  })
  setActivePinia(pinia)
  const feedback_store = use_feedback_store()

  beforeEach(() => {
    feedback_store.$reset()
  })

  describe("state", () => {
    test("initial state", () => {
      expectTypeOf(feedback_store.feedbacks).toEqualTypeOf([])
      expectTypeOf(feedback_store.server_error).toBeBoolean()
    })
  })
  describe("actions", () => {
    describe("add_error", () => {
      test("test add_error", () => {
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
        feedback_store.delete_feedback(0)
        expect(feedback_store.feedbacks.length).toBe(0)
      })
    })

    describe("delete_server_error", () => {
      test("test", () => {
        feedback_store.$patch({ server_error: true })
        feedback_store.delete_server_error()
        expect(feedback_store.server_error).toBe(false)
      })
    })
  })
})
