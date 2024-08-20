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
        geode_url += `/geode`
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
      const errors_store = use_errors_store()
      const infra_store = use_infra_store()
      return new Promise((resolve, reject) => {
        useFetch("/ping", {
          baseURL: infra_store.api_url,
          method: "POST",
          onRequestError({ error }) {
            console.log("onRequestError", error)
            errors_store.$patch({ server_error: true })
            reject(error)
          },
          onResponse({ response }) {
            if (response.ok) {
              console.log("PATCH onResponse", response)
              this.is_running = true
              resolve(response)
            }
          },
          onResponseError({ response }) {
            console.log("onResponseError", response)
            
            errors_store.$patch({ server_error: true })
            reject(response)
          },
        })
      })
    },
    start_request() {
      this.request_counter++
    },
    stop_request() {
      this.request_counter--
    },
  },
})
