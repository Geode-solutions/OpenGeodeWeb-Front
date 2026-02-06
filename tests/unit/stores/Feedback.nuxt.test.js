import { describe, expect, expectTypeOf, test, vi } from "vitest"
import { createTestingPinia } from "@pinia/testing"
import { setActivePinia } from "pinia"
import { useFeedbackStore } from "@ogw_front/stores/feedback"

// CONSTANTS
const TIMEOUT_MS = 500
const DELAY_MS = 1000
const L1 = 1
const L0 = 0
const INDEX_0 = 0
const STATUS_500 = 500

function setup() {
  const pinia = createTestingPinia({ stubActions: false, createSpy: vi.fn })
  setActivePinia(pinia)
}

describe("feedback store state", () => {
  test("initial state", () => {
    setup()
    const fb = useFeedbackStore()
    expectTypeOf(fb.feedbacks).toEqualTypeOf([])
    expectTypeOf(fb.server_error).toBeBoolean()
  })
})

describe("feedback store", () => {
  describe("add_error", () => {
    test("basic addition", () => {
      setup()
      const fb = useFeedbackStore()
      fb.add_error(STATUS_500, "/t", "m", "d")
      expect(fb.feedbacks).toHaveLength(L1)
      expect(fb.feedbacks[INDEX_0].type).toBe("error")
    })

    test("feedbacks_timeout", () => {
      setup()
      const fb = useFeedbackStore()
      fb.feedbacks_timeout_miliseconds = TIMEOUT_MS
      fb.add_error(STATUS_500, "/t", "m", "d")
      expect(fb.feedbacks).toHaveLength(L1)
      setTimeout(() => expect(fb.feedbacks).toHaveLength(L0), DELAY_MS)
    })
  })

  describe("add_success", () => {
    test("basic success", () => {
      setup()
      const fb = useFeedbackStore()
      fb.feedbacks_timeout_miliseconds = TIMEOUT_MS
      fb.add_success("d")
      expect(fb.feedbacks).toHaveLength(L1)
      expect(fb.feedbacks[INDEX_0].type).toBe("success")
      setTimeout(() => expect(fb.feedbacks).toHaveLength(L0), DELAY_MS)
    })
  })

  describe("delete_feedback", () => {
    test("removal by index", () => {
      setup()
      const fb = useFeedbackStore()
      fb.delete_feedback(INDEX_0)
      expect(fb.feedbacks).toHaveLength(L0)
    })
  })

  describe("delete_server_error", () => {
    test("reset server_error state", () => {
      setup()
      const fb = useFeedbackStore()
      fb.$patch({ server_error: true })
      fb.delete_server_error()
      expect(fb.server_error).toBeFalsy()
    })
  })
})
