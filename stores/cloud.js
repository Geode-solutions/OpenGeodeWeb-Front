import { defineStore } from "pinia"

import { useStorage } from "@vueuse/core"

export const use_cloud_store = defineStore("cloud", {
  state: () => ({
    ID: useStorage("ID", ""),
    is_captcha_validated: false,
    is_connexion_launched: false,
  }),
  getters: {
    is_running: () => {
      return use_geode_store().is_running && use_websocket_store().is_running
    },
    is_busy: () => {
      return use_geode_store().is_busy || use_websocket_store().is_busy
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
        console.log("error", error)
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
      const config = useRuntimeConfig()
      const public_runtime_config = config.public
      const { data, error } = await useFetch(
        `${public_runtime_config.GEODE_PROTOCOL}://${public_runtime_config.API_URL}:${public_runtime_config.GEODE_PORT}${public_runtime_config.SITE_BRANCH}/${public_runtime_config.PROJECT}/createbackend`,
        { method: "POST" },
      )
      if (data.value !== null) {
        this.ID = data.value.ID
        localStorage.setItem("ID", data.value.ID)
        geode_store.is_running = true
        return geode_store.ping_task()
      } else {
        console.log("error : ", error)
        errors_store.server_error = true
      }
    },
  },
})
