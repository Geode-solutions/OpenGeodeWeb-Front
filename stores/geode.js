export const use_geode_store = defineStore("geode", {
  state: () => ({
    PROTOCOL: use_infra_store().is_cloud ? "https" : "http",
    PORT: use_infra_store().is_cloud ? "443" : "5000",
    request_counter: 0,
    is_running: false,
  }),
  getters: {
    base_url() {
      const infra_store = use_infra_store()
      const api_url = infra_store.api_url
      var geode_url = `${api_url}`
      if (infra_store.is_cloud) {
        geode_url += `/${infra_store.ID}/geode`
      }
      return geode_url
    },
    is_busy(state) {
      return state.request_counter > 0
    },
  },
  actions: {
    ping_task() {
      setInterval(() => this.do_ping(), 10 * 1000)
    },
    async do_ping() {
      const feedback_store = use_feedback_store()
      const { data } = await useFetch(`${this.base_url}/ping`, {
        method: "POST",
      })
      if (data.value !== null) {
        this.is_running = true
        return
      } else {
        feedback_store.$patch({ server_error: true })
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
