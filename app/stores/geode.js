import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
import Status from "@ogw_front/utils/status.js"
import { appMode } from "@ogw_front/utils/app_mode.js"

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
      const infra_store = useInfraStore()
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
      const feedback_store = useFeedbackStore()
      return useFetch(back_schemas.opengeodeweb_back.ping.$id, {
        baseURL: this.base_url,
        method: back_schemas.opengeodeweb_back.ping.methods[0],
        body: {},
        onRequestError({ error }) {
          feedback_store.$patch({ server_error: true })
          geode_store.status = Status.NOT_CONNECTED
        },
        onResponse({ response }) {
          if (response.ok) {
            feedback_store.$patch({ server_error: false })
            geode_store.status = Status.CONNECTED
          }
        },
        onResponseError({ response }) {
          feedback_store.$patch({ server_error: true })
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

// Standardized methods for microservice registration
export function geode_request(store, schema, params, callbacks = {}) {
  const { request_error_function, response_function, response_error_function } = callbacks
  const feedback_store = useFeedbackStore()
  const body = params || {}

  store.start_request()

  const method = schema.methods.filter((m) => m !== "OPTIONS")[0]
  const request_options = {
    method: method,
  }
  if (body && Object.keys(body).length > 0) {
    request_options.body = body
  }

  if (schema.max_retry) {
    request_options.max_retry = schema.max_retry
  }

  return useFetch(schema.$id, {
    baseURL: store.base_url,
    ...request_options,
    async onRequestError({ error }) {
      await store.stop_request()
      await feedback_store.add_error(
        error.code,
        schema.$id,
        error.message,
        error.stack,
      )
      if (request_error_function) {
        await request_error_function(error)
      }
    },
    async onResponse({ response }) {
      if (response.ok) {
        await store.stop_request()
        if (response_function) {
          await response_function(response)
        }
      }
    },
    async onResponseError({ response }) {
      await store.stop_request()
      await feedback_store.add_error(
        response.status,
        schema.$id,
        response._data.name,
        response._data.description,
      )
      if (response_error_function) {
        await response_error_function(response)
      }
    },
  })
}

export function geode_connect(store) {
  return store.do_ping()
}
