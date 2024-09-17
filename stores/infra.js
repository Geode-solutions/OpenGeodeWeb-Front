import { useStorage } from "@vueuse/core"
import isElectron from "is-electron"

export const use_infra_store = defineStore("infra", {
  state: () => ({
    ID: useStorage("ID", ""),
    is_captcha_validated: false,
    is_connexion_launched: false,
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
    is_running() {
      return use_geode_store().is_running && use_viewer_store().is_running
    },
    is_busy() {
      return use_geode_store().is_busy || use_viewer_store().is_busy
    },
  },
  actions: {
    async create_connexion() {
      const geode_store = use_geode_store()
      if (this.is_connexion_launched) {
        return
      }
      this.is_connexion_launched = true
      if (["", null].includes(this.ID) || typeof this.ID === "undefined") {
        return this.create_backend()
      } else {
        try {
          await geode_store.do_ping()
          return geode_store.ping_task()
        } catch (e) {
          return this.create_backend()
        }
      }
    },
    async create_backend() {
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
        return
      } else {
        const { data, error } = await useFetch(this.lambda_url, {
          method: "POST",
        })
        if (data.value !== null) {
          this.ID = data.value.ID
          localStorage.setItem("ID", data.value.ID)
          geode_store.$patch({ is_running: true })
          return geode_store.ping_task()
        } else {
          feedback_store.server_error = true
        }
      }
    },
  },
})
