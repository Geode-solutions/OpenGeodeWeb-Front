import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
import Status from "@ogw_f/utils/status.js"

export const use_geode_store = defineStore("geode", {
  state: () => ({
    port: "99",
    request_counter: 0,
    status: Status.NOT_CONNECTED,
  }),
  getters: {
    protocol() {
      if (use_infra_store().app_mode == appMode.CLOUD) {
        return "https"
      }
      return "http"
    },
    base_url() {
      const infra_store = use_infra_store()
      let geode_url = `${this.protocol}://${infra_store.domain_name}:${this.port}`
      if (infra_store.app_mode == appMode.CLOUD) {
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
        if (this.status == Status.CONNECTED) {
          this.do_ping()
        }
      }, 10 * 1000)
    },
    do_ping() {
      const geode_store = this
      const feedback_store = use_feedback_store()
      return useFetch(back_schemas.opengeodeweb_back.ping.$id, {
        baseURL: this.base_url,
        method: back_schemas.opengeodeweb_back.ping.methods[0],
        body: {},
        onRequestError({ error }) {
          feedback_store.server_error = true
          geode_store.status = Status.NOT_CONNECTED
        },
        onResponse({ response }) {
          if (response.ok) {
            feedback_store.server_error = false
            geode_store.status = Status.CONNECTED
          }
        },
        onResponseError({ response }) {
          feedback_store.server_error = true
          geode_store.status = Status.NOT_CONNECTED
        },
      })
    },
    start_request() {
      this.request_counter++
    },
    stop_request() {
      this.request_counter--
    },
  },
  share: {
    omit: ["status"],
  },
})
