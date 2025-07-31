import { useStorage } from "@vueuse/core"
import Status from "@ogw_f/utils/status.js"

export const use_infra_store = defineStore("infra", {
  state: () => ({
    app_mode: getAppMode(),
    ID: useStorage("ID", ""),
    is_captcha_validated: false,
    status: Status.NOT_CREATED,
  }),
  getters: {
    domain_name() {
      if (this.app_mode == appMode.appMode.CLOUD) {
        return useRuntimeConfig().public.API_URL
      }
      return "localhost"
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
      console.log("create_backend this.app_mode", this.app_mode)
      if (this.status === Status.CREATED) return
      return navigator.locks.request("infra.create_backend", async (lock) => {
        this.status = Status.CREATING
        if (this.status === Status.CREATED) return
        console.log("LOCK GRANTED !", lock)
        if (this.app_mode == appMode.appMode.DESKTOP) {
          const viewer_store = use_viewer_store()
          const geode_store = use_geode_store()
          const back_port = await window.electronAPI.run_back(
            geode_store.default_local_port,
          )
          geode_store.$patch({ default_local_port: back_port })
          const viewer_port = await window.electronAPI.run_viewer(
            viewer_store.default_local_port,
          )
          viewer_store.$patch({ default_local_port: viewer_port })
        } else if (this.app_mode == appMode.appMode.CLOUD) {
          const { data, error } = await useFetch(this.lambda_url, {
            method: "POST",
          })
          if (error.value || !data.value) {
            this.status = Status.NOT_CREATED
            const feedback_store = use_feedback_store()
            feedback_store.server_error = true
            return
          }
          this.ID = data.value.ID
          localStorage.setItem("ID", data.value.ID)
        }
        this.status = Status.CREATED
        return this.create_connection()
      })
    },
    async create_connection() {
      console.log("create_connection")
      await use_viewer_store().ws_connect()
      await use_geode_store().do_ping()
      return
    },
  },
})
