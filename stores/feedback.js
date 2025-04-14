export const use_feedback_store = defineStore("feedback", {
  state: () => ({
    feedbacks: [],
    server_error: false,
    feedbacks_timeout_miliseconds: 5000,
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
      const feedback_index = this.feedbacks.length - 1
      setTimeout(() => {
        this.delete_feedback(feedback_index)
      }, this.feedbacks_timeout_miliseconds)
    },
    async add_success(description) {
      await this.feedbacks.push({
        type: "success",
        description,
      })
      const feedback_index = this.feedbacks.length - 1
      setTimeout(() => {
        this.delete_feedback(feedback_index)
      }, this.feedbacks_timeout_miliseconds)
    },
    async delete_feedback(feedback_index) {
      await this.feedbacks.splice(feedback_index, 1)
    },
    async delete_server_error() {
      this.server_error = false
    },
  },
})
