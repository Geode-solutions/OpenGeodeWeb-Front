import { useStorage } from "@vueuse/core"
import isElectron from "is-electron"
import Status from "@ogw_f/utils/status.js"
import { appMode, getAppMode } from "@ogw_f/utils/app_mode.js"

export const use_infra_store = defineStore("infra", {
  state: () => ({
    app_mode: getAppMode(),
    ID: useStorage("ID", ""),
    is_captcha_validated: this.app_mode != appMode.CLOUD ? true : false,
    status: Status.NOT_CREATED,
  }),
  getters: {
    domain_name() {
      if (this.app_mode == appMode.CLOUD) {
        return useRuntimeConfig().public.API_URL
      } else {
        return "localhost"
      }
    },
    lambda_url() {
      const geode_store = use_geode_store()
      const public_runtime_config = useRuntimeConfig().public
      const url =
        geode_store.protocol +
        "://" +
        this.domain_name +
        ":" +
        geode_store.port +
        public_runtime_config.SITE_BRANCH +
        public_runtime_config.PROJECT +
        "/createbackend"
      return url
    },
    microservices_connected() {
      return (
        use_geode_store().status == Status.CONNECTED &&
        use_viewer_store().status == Status.CONNECTED
      )
    },
    microservices_busy() {
      return use_geode_store().is_busy || use_viewer_store().is_busy
    },
  },
  actions: {
    async create_backend() {
      if (this.status === Status.CREATED) return
      return navigator.locks.request("infra.create_backend", async (lock) => {
        this.status = Status.CREATING
        if (this.status === Status.CREATED) return
        console.log("LOCK GRANTED !", lock)
        if (this.app_mode != appMode.BROWSER) {
          const geode_store = use_geode_store()
          const viewer_store = use_viewer_store()
          const feedback_store = use_feedback_store()
          if (isElectron()) {
            const back_port = await window.electronAPI.run_back(
              geode_store.port,
            )
            geode_store.$patch({ default_local_port: back_port })
            const viewer_port = await window.electronAPI.run_viewer(
              viewer_store.port,
            )
            viewer_store.$patch({ default_local_port: viewer_port })
          } else {
            const { data, error } = await useFetch(this.lambda_url, {
              method: "POST",
            })
            if (error.value || !data.value) {
              this.status = Status.NOT_CREATED
              feedback_store.server_error = true
              return
            }
            this.ID = data.value.ID
            localStorage.setItem("ID", data.value.ID)
          }
        }
        this.status = Status.CREATED
        return this.create_connection()
      })
    },
    async create_connection() {
      await use_viewer_store().ws_connect()
      await use_geode_store().do_ping()
      return
    },
  },
})
