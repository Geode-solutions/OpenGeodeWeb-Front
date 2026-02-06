import { v4 as uuidv4 } from "uuid"

const MILLISECONDS_IN_SECOND = 1000
const DEFAULT_FEEDBACKS_TIMEOUT_SECONDS = 10

export const useFeedbackStore = defineStore("feedback", {
  state: () => ({
    feedbacks: [],
    server_error: false,
    feedbacks_timeout_miliseconds:
      DEFAULT_FEEDBACKS_TIMEOUT_SECONDS * MILLISECONDS_IN_SECOND,
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
