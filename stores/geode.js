import back_schemas from "@geode/opengeodeweb-back/schemas.json"

export const use_geode_store = defineStore("geode", {
  state: () => ({
    default_local_port: "5000",
    request_counter: 0,
    is_running: false,
  }),
  getters: {
    protocol() {
      if (use_infra_store().is_cloud) {
        return "https"
      } else {
        return "http"
      }
    },
    port() {
      if (use_infra_store().is_cloud) {
        return "443"
      } else {
        return this.default_local_port
      }
    },
    base_url() {
      const infra_store = use_infra_store()
      var geode_url = `${this.protocol}://${infra_store.domain_name}:${this.port}`
      if (infra_store.is_cloud) {
        if (infra_store.ID == "") {
          throw new Error("ID must not be empty in cloud mode")
        }
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
      await api_fetch(
        { schema: back_schemas.opengeodeweb_back.ping, params: {} },
        {
          request_error_function: async () => {
            await feedback_store.$patch({ server_error: true })
            this.is_running = false
          },
          response_function: async () => {
            this.is_running = true
          },
          response_error_function: async () => {
            await feedback_store.$patch({ server_error: true })
            this.is_running = false
          },
        },
      )
    },
    start_request() {
      this.request_counter++
    },
    stop_request() {
      this.request_counter--
    },
  },
})
