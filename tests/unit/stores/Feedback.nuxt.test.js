import { describe, expect, expectTypeOf, test, vi } from "vitest"
import { createTestingPinia } from "@pinia/testing"
import { setActivePinia } from "pinia"
import { useFeedbackStore } from "@ogw_front/stores/feedback"

// CONSTANTS
const TIMEOUT_MS = 500
const DELAY_MS = 1000
const EXPECTED_ONE_FEEDBACK = 1
const EXPECTED_NO_FEEDBACKS = 0
const INDEX_0 = 0
const STATUS_500 = 500

function setup() {
  const pinia = createTestingPinia({ stubActions: false, createSpy: vi.fn })
  setActivePinia(pinia)
}

describe("feedback store state", () => {
  test("initial state", () => {
    setup()
    const fb_store = useFeedbackStore()
    expectTypeOf(fb_store.feedbacks).toEqualTypeOf([])
    expectTypeOf(fb_store.server_error).toBeBoolean()
  })
})

describe("feedback store", () => {
  describe("add_error", () => {
    test("basic addition", () => {
      setup()
      const fb_store = useFeedbackStore()
      fb_store.add_error(STATUS_500, "/t", "m", "d")
      expect(fb_store.feedbacks).toHaveLength(EXPECTED_ONE_FEEDBACK)
      expect(fb_store.feedbacks[INDEX_0].type).toBe("error")
    })

    test("feedbacks_timeout", () => {
      setup()
      const fb_store = useFeedbackStore()
      fb_store.feedbacks_timeout_miliseconds = TIMEOUT_MS
      fb_store.add_error(STATUS_500, "/t", "m", "d")
      expect(fb_store.feedbacks).toHaveLength(EXPECTED_ONE_FEEDBACK)
      setTimeout(
        () => expect(fb_store.feedbacks).toHaveLength(EXPECTED_NO_FEEDBACKS),
        DELAY_MS,
      )
    })
  })

  describe("add_success", () => {
    test("basic success", () => {
      setup()
      const fb_store = useFeedbackStore()
      fb_store.feedbacks_timeout_miliseconds = TIMEOUT_MS
      fb_store.add_success("d")
      expect(fb_store.feedbacks).toHaveLength(EXPECTED_ONE_FEEDBACK)
      expect(fb_store.feedbacks[INDEX_0].type).toBe("success")
      setTimeout(
        () => expect(fb_store.feedbacks).toHaveLength(EXPECTED_NO_FEEDBACKS),
        DELAY_MS,
      )
    })
  })

  describe("delete_feedback", () => {
    test("removal by index", () => {
      setup()
      const fb_store = useFeedbackStore()
      fb_store.delete_feedback(INDEX_0)
      expect(fb_store.feedbacks).toHaveLength(EXPECTED_NO_FEEDBACKS)
    })
  })

  describe("delete_server_error", () => {
    test("reset server_error state", () => {
      setup()
      const fb_store = useFeedbackStore()
      fb_store.$patch({ server_error: true })
      fb_store.delete_server_error()
      expect(fb_store.server_error).toBeFalsy()
    })
  })
})
