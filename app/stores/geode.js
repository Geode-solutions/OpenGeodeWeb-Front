import Status from "@ogw_front/utils/status"
import { api_fetch } from "../../internal/utils/api_fetch"
import { appMode } from "@ogw_front/utils/app_mode"
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
import { useFeedbackStore } from "@ogw_front/stores/feedback"
import { useInfraStore } from "@ogw_front/stores/infra"
import { useAppStore } from "@ogw_front/stores/app"
import { upload_file } from "../../internal/utils/upload_file.js"

const MILLISECONDS_IN_SECOND = 1000
const DEFAULT_PING_INTERVAL_SECONDS = 10

export const useGeodeStore = defineStore("geode", {
  state: () => ({
    default_local_port: "5000",
    request_counter: 0,
    status: Status.NOT_CONNECTED,
  }),
  getters: {
    protocol() {
      if (useInfraStore().app_mode === appMode.CLOUD) {
        return "https"
      }
      return "http"
    },
    port() {
      if (useInfraStore().app_mode === appMode.CLOUD) {
        return "443"
      }
      return this.default_local_port
    },
    base_url() {
      const infraStore = useInfraStore()
      let geode_url = `${this.protocol}://${infraStore.domain_name}:${this.port}`
      if (infraStore.app_mode === appMode.CLOUD) {
        if (infraStore.ID === "") {
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
    set_ping() {
      this.ping()
      setInterval(() => {
        this.ping()
      }, DEFAULT_PING_INTERVAL_SECONDS * MILLISECONDS_IN_SECOND)
    },
    ping() {
      const geodeStore = this
      const feedbackStore = useFeedbackStore()
      return this.request(
        back_schemas.opengeodeweb_back.ping,
        {},
        {
          request_error_function: () => {
            feedbackStore.$patch({ server_error: true })
            geodeStore.status = Status.NOT_CONNECTED
          },
          response_function: () => {
            feedbackStore.$patch({ server_error: false })
            geodeStore.status = Status.CONNECTED
          },
          response_error_function: () => {
            feedbackStore.$patch({ server_error: true })
            geodeStore.status = Status.NOT_CONNECTED
          },
        },
      )
    },
    start_request() {
      this.request_counter += 1
    },
    stop_request() {
      this.request_counter -= 1
    },
    launch(args) {
      console.log("[GEODE] Launching back microservice...", { args })
      const appStore = useAppStore()

      const { BACK_PATH, BACK_COMMAND } = useRuntimeConfig().public

      console.log("[GEODE] BACK_PATH", BACK_PATH)
      console.log("[GEODE] BACK_COMMAND", BACK_COMMAND)
      const schema = {
        $id: "/api/app/run_back",
        methods: ["POST"],
        type: "object",
        properties: {
          BACK_PATH: { type: "string" },
          BACK_COMMAND: { type: "string" },
        },
        required: ["BACK_PATH", "BACK_COMMAND"],
        additionalProperties: true,
      }

      const params = {
        BACK_PATH,
        BACK_COMMAND,
        args,
      }

      console.log("[GEODE] params", params)
      return appStore.request(schema, params, {
        response_function: (response) => {
          console.log("[GEODE] Back launched", { response })
          this.default_local_port = response.port
          console.log("[GEODE] Back launched", this.default_local_port)
        },
      })
    },
    connect() {
      console.log("[GEODE] Connecting to geode microservice...")
      this.set_ping()
      return Promise.resolve()
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
    upload(file, callbacks = {}) {
      return upload_file(
        this,
        {
          route: back_schemas.opengeodeweb_back.upload_file.$id,
          file,
        },
        {
          ...callbacks,
          response_function: async (response) => {
            console.log("[GEODE] Request completed:", route)
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
