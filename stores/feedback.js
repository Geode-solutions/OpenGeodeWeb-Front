export const use_feedback_store = defineStore("feedback", {
  state: () => ({
    feedbacks: [],
    server_error: false,
  }),
  actions: {
    async add_error(code, route, name, description) {
      await this.feedbacks.push({
        type: "error",
        code,
        route,
        name,
        description,
      })
    },
    async add_success(description) {
      await this.feedbacks.push({
        type: "success",
        description,
      })
    },
    async delete_feedback(feedback_index) {
      await this.feedbacks.splice(feedback_index, 1)
    },
    async delete_server_error() {
      this.server_error = false
    },
  },
})
