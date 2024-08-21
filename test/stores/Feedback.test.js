import { setActivePinia, createPinia } from "pinia"
import { use_feedback_store } from "@/stores/feedback"
import { describe, it, expect, beforeEach } from "vitest"

describe("Feedback store", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it("add_feedback", () => {
    const feedback_store = use_feedback_store()
    expect(feedback_store.feedbacks.length).toBe(0)
    feedback_store.add_feedback({
      type: "error",
      code: 500,
      route: "/test",
      name: "test message",
      description: "test description",
    })
    expect(feedback_store.feedbacks.length).toBe(1)
  })

  it("delete_feedback", () => {
    const feedback_store = use_feedback_store()
    expect(feedback_store.feedbacks.length).toBe(0)
    feedback_store.delete_feedback(0)
    expect(feedback_store.feedbacks.length).toBe(0)
  })

  it("delete_server_error", () => {
    const feedback_store = use_feedback_store()
    feedback_store.$patch({ server_error: true })
    expect(feedback_store.server_error).toBe(true)
    feedback_store.delete_server_error()
    expect(feedback_store.server_error).toBe(false)
  })
})
