import { useStorage } from "@vueuse/core"
import isElectron from "is-electron"
import Status from "@/utils/status.js"

export const use_infra_store = defineStore("infra", {
  state: () => ({
    ID: useStorage("ID", ""),
    is_captcha_validated:
      is_cloud() || process.env.NODE_ENV === "development" ? true : false,
    status: Status.NOT_CREATED,
  }),
  getters: {
    is_cloud() {
      return (
        !isElectron() && useRuntimeConfig().public.NODE_ENV === "production"
      )
    },
    domain_name() {
      if (this.is_cloud) {
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
      navigator.locks.request("infra.create_backend", async (lock) => {
        this.status = Status.CREATING
        if (this.status === Status.CREATED) return
        console.log("LOCK GRANTED !", lock)
        const geode_store = use_geode_store()
        const viewer_store = use_viewer_store()
        const feedback_store = use_feedback_store()
        if (isElectron()) {
          const back_port = await window.electronAPI.run_back(geode_store.port)
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
