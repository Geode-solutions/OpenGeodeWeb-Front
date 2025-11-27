import Status from "@ogw_front/utils/status.js"

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
      const infra_store = useInfraStore()
      const public_runtime_config = useRuntimeConfig().public
      const url =
        this.protocol +
        "://" +
        infra_store.domain_name +
        ":" +
        this.port +
        public_runtime_config.SITE_BRANCH +
        public_runtime_config.PROJECT +
        "/createbackend"
      return url
    },
    is_busy() {
      return false
    },
  },
  actions: {
    async launch() {
      const infra_store = useInfraStore()
      const feedback_store = useFeedbackStore()
      
      const { data, error } = await useFetch(this.base_url, {
        method: "POST",
      })
      
      if (error.value || !data.value) {
        this.status = Status.NOT_CONNECTED
        feedback_store.server_error = true
        throw new Error("Failed to launch lambda backend")
      }
      
      infra_store.ID = data.value.ID
      localStorage.setItem("ID", data.value.ID)
      this.status = Status.CONNECTED
      
      return data.value
    },
    async connect() {
      this.status = Status.CONNECTED
      return Promise.resolve()
    },
    async request(schema, params, callbacks = {}) {
      throw new Error("Lambda store does not handle direct requests")
    },
  },
  share: {
    omit: ["status"],
  },
})
