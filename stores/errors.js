export const use_errors_store = defineStore('errors', {
  state: () => ({
    errors: [],
    server_error: false,
  }),
  actions: {
    add_error (error_object) {
      this.errors.push(error_object)
      console.log(this.errors)
    },
    delete_error (error_index) {
      this.errors.splice(error_index, 1)
    },
    delete_server_error () {
      this.server_error = false
    }
  }
})
