export const use_feedback_store = defineStore("feedback", {
  state: () => ({
    feedbacks: [],
    server_error: false,
  }),
  actions: {
    add_feedback(feedback) {
      this.feedbacks.push(feedback)
    },
    delete_feedback(feedback_index) {
      this.feedbacks.splice(feedback_index, 1)
    },
    delete_server_error() {
      this.server_error = false
    },
  },
})
