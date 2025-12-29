import { v4 as uuidv4 } from "uuid"

export const useFeedbackStore = defineStore("feedback", {
  state: () => ({
    feedbacks: [],
    server_error: false,
    feedbacks_timeout_miliseconds: 10 * 1000,
  }),
  actions: {
    async add_error(code, route, name, description) {
      const feedbackId = uuidv4()
      await this.feedbacks.push({
        id: feedbackId,
        type: "error",
        code,
        route,
        name,
        description,
      })
      setTimeout(() => {
        this.delete_feedback(feedbackId)
      }, this.feedbacks_timeout_miliseconds)
    },
    async add_success(description) {
      const feedbackId = uuidv4()
      await this.feedbacks.push({
        id: feedbackId,
        type: "success",
        description,
      })
      setTimeout(() => {
        this.delete_feedback(feedbackId)
      }, this.feedbacks_timeout_miliseconds)
    },
    async delete_feedback(feedbackId) {
      this.feedbacks = this.feedbacks.filter(
        (feedback) => feedback.id !== feedbackId,
      )
    },
    async delete_server_error() {
      this.server_error = false
    },
  },
})
