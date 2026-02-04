import Status from "@ogw_front/utils/status"
import { useFeedbackStore } from "@ogw_front/stores/feedback"

export const useLambdaStore = defineStore("lambda", {
  state: () => ({
    status: Status.NOT_CONNECTED,
  }),
  getters: {
    protocol() {
      return "https"
    },
    port() {
      return "443"
    },
    base_url() {
      const public_runtime_config = useRuntimeConfig().public
      const domain_name = public_runtime_config.API_URL
      const url =
        `${this.protocol}://${domain_name}:${this.port}${public_runtime_config.SITE_BRANCH}${public_runtime_config.PROJECT}/createbackend`
      return url
    },
    is_busy() {
      return false
    },
  },
  actions: {
    async launch() {
      console.log("[LAMBDA] Launching lambda backend...")
      const feedbackStore = useFeedbackStore()

      const { data, error } = await useFetch(this.base_url, {
        method: "POST",
      })

      if (error.value || !data.value) {
        this.status = Status.NOT_CONNECTED
        feedbackStore.server_error = true
        console.error("[LAMBDA] Failed to launch lambda backend", error.value)
        throw new Error("Failed to launch lambda backend")
      }

      this.status = Status.CONNECTED
      const id = data.value.ID

      console.log("[LAMBDA] Lambda launched, ID:", id)
      return id
    },
    async connect() {
      console.log("[LAMBDA] Lambda connected")
      this.status = Status.CONNECTED
      return Promise.resolve()
    },
  },
  share: {
    omit: ["status"],
  },
})
