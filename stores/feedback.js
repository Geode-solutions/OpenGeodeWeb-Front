export const use_feedback_store = defineStore("feedback", {
  state: () => ({
    feedbacks: [],
    server_error: false,
  }),
  actions: {
    add_error(code, route, name, description) {
      this.feedbacks.push({
        type: "error",
        code,
        route,
        name,
        description,
      })
    },

    add_success( description) {
      this.feedbacks.push({
        type: "success",
        description,
      })
    },
    delete_feedback(feedback_index) {
      this.feedbacks.splice(feedback_index, 1)
    },
    delete_server_error() {
      this.server_error = false
    },
  },
})
