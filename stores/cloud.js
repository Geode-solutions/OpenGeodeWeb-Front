import { useFetch, useStorage } from "@vueuse/core"

export const use_cloud_store = defineStore("cloud", {
  state: () => ({
    ID: useStorage("ID", ""),
    is_captcha_validated: false,
    is_connexion_launched: false,
  }),
  getters: {
    api_url: () => {
      const public_runtime_config = useRuntimeConfig().public
      if (public_runtime_config.NODE_ENV == "test") {
        return ""
      }
      var api_url = `${public_runtime_config.GEODE_PROTOCOL}://${public_runtime_config.API_URL}:${public_runtime_config.GEODE_PORT}`
      return api_url
    },
    is_running: () => {
      return use_geode_store().is_running && use_viewer_store().is_running
    },
    is_busy: () => {
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
      if (
        this.ID === "" ||
        this.ID === null ||
        typeof this.ID === "undefined"
      ) {
        return this.create_backend()
      } else {
        const { data, error } = await useFetch(`${geode_store.base_url}/ping`, {
          method: "POST",
        })
        if (data.value !== null) {
          geode_store.is_running = true
          return geode_store.ping_task()
        } else {
          return this.create_backend()
        }
      }
    },
    async create_backend() {
      const geode_store = use_geode_store()
      const errors_store = use_errors_store()
      const public_runtime_config = useRuntimeConfig().public
      const url = this.api_url.concat(
        public_runtime_config.SITE_BRANCH,
        public_runtime_config.PROJECT,
        "/createbackend",
      )
      const { data, error } = await useFetch(url, {
        method: "POST",
      })
      if (data.value !== null) {
        this.ID = data.value.ID
        localStorage.setItem("ID", data.value.ID)
        geode_store.$patch({ is_running: true })
        return geode_store.ping_task()
      } else {
        errors_store.server_error = true
      }
    },
  },
})
