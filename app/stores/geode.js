import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
import Status from "@ogw_front/utils/status"
import { appMode } from "@ogw_front/utils/app_mode"
import { api_fetch } from "../../internal/utils/api_fetch"
import { useInfraStore } from "@ogw_front/stores/infra"
import { useFeedbackStore } from "@ogw_front/stores/feedback"

export const useGeodeStore = defineStore("geode", {
  state: () => ({
    default_local_port: "5000",
    request_counter: 0,
    status: Status.NOT_CONNECTED,
  }),
  getters: {
    protocol() {
      if (useInfraStore().app_mode == appMode.CLOUD) {
        return "https"
      }
      return "http"
    },
    port() {
      if (useInfraStore().app_mode == appMode.CLOUD) {
        return "443"
      }
      const GEODE_PORT = useRuntimeConfig().public.GEODE_PORT
      if (GEODE_PORT != null && GEODE_PORT !== "") {
        return GEODE_PORT
      }
      return this.default_local_port
    },
    base_url() {
      const infraStore = useInfraStore()
      let geode_url = `${this.protocol}://${infraStore.domain_name}:${this.port}`
      if (infraStore.app_mode == appMode.CLOUD) {
        if (infraStore.ID == "") {
          throw new Error("ID must not be empty in cloud mode")
        }
        geode_url += `/${infraStore.ID}/geode`
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
        this.do_ping()
      }, 10 * 1000)
    },
    do_ping() {
      const geodeStore = this
      const feedbackStore = useFeedbackStore()
      return useFetch(back_schemas.opengeodeweb_back.ping.$id, {
        baseURL: this.base_url,
        method: back_schemas.opengeodeweb_back.ping.methods[0],
        body: {},
        onRequestError({ error }) {
          feedbackStore.$patch({ server_error: true })
          geodeStore.status = Status.NOT_CONNECTED
        },
        onResponse({ response }) {
          if (response.ok) {
            feedbackStore.$patch({ server_error: false })
            geodeStore.status = Status.CONNECTED
          }
        },
        onResponseError({ response }) {
          feedbackStore.$patch({ server_error: true })
          geodeStore.status = Status.NOT_CONNECTED
        },
      })
    },
    start_request() {
      this.request_counter++
    },
    stop_request() {
      this.request_counter--
    },
    launch() {
      console.log("[GEODE] Launching geode microservice...")
      return window.electronAPI.run_back()
    },
    connect() {
      console.log("[GEODE] Connecting to geode microservice...")
      return this.ping_task()
    },
    request(schema, params, callbacks = {}) {
      console.log("[GEODE] Request:", schema.$id)

      return api_fetch(
        this,
        { schema, params },
        {
          ...callbacks,
          response_function: async (response) => {
            console.log("[GEODE] Request completed:", schema.$id)
            if (callbacks.response_function) {
              await callbacks.response_function(response)
            }
          },
        },
      )
    },
  },
  share: {
    omit: ["status"],
  },
})
