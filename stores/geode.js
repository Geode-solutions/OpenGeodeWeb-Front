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
    is_busy() {
      return this.request_counter > 0
    },
  },
  actions: {
    ping_task() {
      setInterval(() => {
        if (this.is_running) {
          this.do_ping()
        }
      }, 10 * 1000)
    },
    async do_ping() {
      const feedback_store = use_feedback_store()
      const geode_store = use_geode_store()
      return new Promise((resolve, reject) => {
        useFetch(back_schemas.opengeodeweb_back.ping.$id, {
          baseURL: geode_store.base_url,
          method: back_schemas.opengeodeweb_back.ping.methods[0],
          async onRequestError() {
            await feedback_store.$patch({ server_error: true })
            geode_store.is_running = false
            reject()
          },
          async onResponse() {
            resolve()
          },
          async onResponseError() {
            await feedback_store.$patch({ server_error: true })
            geode_store.is_running = false
            reject()
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
