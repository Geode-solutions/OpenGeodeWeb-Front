import { useStorage } from "@vueuse/core"
import Status from "@ogw_f/utils/status.js"
import { appMode, getAppMode } from "@ogw_f/utils/app_mode.js"

export const useInfraStore = defineStore("infra", {
  state: () => ({
    app_mode: getAppMode(),
    ID: useStorage("ID", ""),
    is_captcha_validated: false,
    status: Status.NOT_CREATED,
  }),
  getters: {
    domain_name() {
      if (this.app_mode == appMode.CLOUD) {
        return useRuntimeConfig().public.API_URL
      }
      return "localhost"
    },
    lambda_url() {
      const geode_store = useGeodeStore()
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
        useGeodeStore().status == Status.CONNECTED &&
        useViewerStore().status == Status.CONNECTED
      )
    },
    microservices_busy() {
      return useGeodeStore().is_busy || useViewerStore().is_busy
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
        if (this.app_mode == appMode.DESKTOP) {
          const viewer_store = useViewerStore()
          const geode_store = useGeodeStore()
          const [back_port, viewer_port] = await Promise.all([
            window.electronAPI.run_back(),
            window.electronAPI.run_viewer(),
          ])
          geode_store.$patch({ default_local_port: back_port })
          viewer_store.$patch({ default_local_port: viewer_port })
        } else if (this.app_mode == appMode.CLOUD) {
          const { data, error } = await useFetch(this.lambda_url, {
            method: "POST",
          })
          if (error.value || !data.value) {
            this.status = Status.NOT_CREATED
            const feedback_store = useFeedbackStore()
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
      await useViewerStore().ws_connect()
      await useGeodeStore().do_ping()
      return
    },
  },
})
