export const use_geode_store = defineStore('geode', {
  state: () => ({
    request_counter: 0,
    is_client_created: false
  }),
  getters: {
    api_busy: (state) => {
      return state.request_counter > 0
    }
  },
  actions: {
    start_request () {
      this.request_counter++
    },
    stop_request () {
      this.request_counter--
    }
  }
})
