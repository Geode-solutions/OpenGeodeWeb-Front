import { useStorage } from "@vueuse/core"
import Status from "@ogw_front/utils/status.js"
import { appMode, getAppMode } from "@ogw_front/utils/app_mode.js"

const microserviceRegistry = []
export function registerMicroservice(config) {
  microserviceRegistry.push(config)
}

export const useInfraStore = defineStore("infra", {
  state: () => ({
    app_mode: getAppMode(),
    ID: useStorage("ID", ""),
    is_captcha_validated: false,
    status: Status.NOT_CREATED,
    microservices: [],
  }),
  getters: {
    domain_name() {
      if (this.app_mode == appMode.CLOUD) {
        return useRuntimeConfig().public.API_URL
      }
      return "localhost"
    },
    lambda_url() {
      const geode_store = this.get_microservice_store("geode")
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
      if (this.microservices.length === 0) {
        this.init_microservices()
      }
      return this.microservices.every(
        (microservice) => microservice.store.status === Status.CONNECTED,
      )
    },
    microservices_busy() {
      if (this.microservices.length === 0) {
        this.init_microservices()
      }
      return this.microservices.some(
        (microservice) => microservice.store.is_busy === true,
      )
    },
  },
  actions: {
    init_microservices() {
      if (this.microservices.length > 0) return
      this.microservices = microserviceRegistry.map((config) => ({
        name: config.name,
        store: config.useStore(),
        connect: config.connect,
        electron_runner: config.electron_runner,
      }))
    },
    get_microservice_store(name) {
      if (this.microservices.length === 0) {
        this.init_microservices()
      }
      const microservice = this.microservices.find(
        (microservice) => microservice.name === name,
      )
      return microservice.store
    },
    async create_backend() {
      console.log("create_backend this.app_mode", this.app_mode)
      if (this.status === Status.CREATED) return
      if (this.microservices.length === 0) {
        this.init_microservices()
      }
      return navigator.locks.request("infra.create_backend", async (lock) => {
        this.status = Status.CREATING
        if (this.status === Status.CREATED) return
        console.log("LOCK GRANTED !", lock)
        if (this.app_mode == appMode.DESKTOP) {
          const port_promises = this.microservices.map((microservice) =>
            window.electronAPI[microservice.electron_runner](),
          )
          const ports = await Promise.all(port_promises)
          this.microservices.forEach((microservice, index) => {
            microservice.store.$patch({ default_local_port: ports[index] })
          })
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
      await Promise.all(
        this.microservices.map((microservice) =>
          microservice.connect(microservice.store),
        ),
      )
      return
    },
  },
  share: {
    omit: ["status", "microservices", "_initialized"],
  },
})
