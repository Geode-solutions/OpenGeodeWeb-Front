export const use_geode_store = defineStore("geode", {
  state: () => ({
    request_counter: 0,
    is_running: false,
  }),
  getters: {
    base_url: () => {
      const cloud_store = use_cloud_store()
      const api_url = cloud_store.api_url
      var geode_url = `${api_url}`
      const public_runtime_config = useRuntimeConfig().public
      if (public_runtime_config.NODE_ENV == "production") {
        geode_url += `/${cloud_store.ID}/geode`
      }
      return geode_url
    },
    is_busy: (state) => {
      return state.request_counter > 0
    },
  },
  actions: {
    ping_task() {
      setInterval(() => this.do_ping(), 10 * 1000)
    },
    async do_ping() {
      const errors_store = use_errors_store()
      const { data } = await useFetch(`${this.base_url}/ping`, {
        method: "POST",
      })
      if (data.value !== null) {
        this.is_running = true
        return
      } else {
        errors_store.$patch({ server_error: true })
        return
      }
    },
    start_request() {
      this.request_counter++
    },
    stop_request() {
      this.request_counter--
    },
  },
})
