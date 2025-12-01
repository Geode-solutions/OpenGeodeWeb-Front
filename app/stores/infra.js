import Status from "@ogw_front/utils/status.js"
import { appMode, getAppMode } from "@ogw_front/utils/app_mode.js"

export const useInfraStore = defineStore("infra", {
  state: () => ({
    app_mode: getAppMode(),
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
    microservices_connected() {
      return this.microservices.every(
        (m) => m.store.status === Status.CONNECTED,
      )
    },
    microservices_busy() {
      return this.microservices.some((m) => m.store.is_busy === true)
    },
  },
  actions: {
    register_microservice(store, { request, connect, launch }) {
      const store_name = store.$id
      console.log("[INFRA] Registering microservice:", store_name)

      if (
        !this.microservices.find(
          (microservice) => microservice.store.$id === store_name,
        )
      ) {
        this.microservices.push({ store, request, connect, launch })
        console.log("[INFRA] Microservice registered:", store_name)
      }
    },
    async create_backend() {
      console.log("[INFRA] Starting create_backend - Mode:", this.app_mode)
      console.log(
        "[INFRA] Registered microservices:",
        this.microservices.map((microservice) => microservice.store.$id),
      )

      if (this.status === Status.CREATED) return

      return navigator.locks.request("infra.create_backend", async (lock) => {
        this.status = Status.CREATING
        if (this.status === Status.CREATED) return
        console.log("[INFRA] Lock granted for create_backend")

        if (this.app_mode == appMode.DESKTOP) {
          console.log("[INFRA] DESKTOP mode - Launching microservices...")
          const microservices_with_launch = this.microservices.filter(
            (microservice) => microservice.launch,
          )

          const port_promises = microservices_with_launch.map((microservice) =>
            microservice.launch(),
          )
          const ports = await Promise.all(port_promises)

          microservices_with_launch.forEach((microservice, index) => {
            microservice.store.$patch({ default_local_port: ports[index] })
          })
        } else if (this.app_mode == appMode.CLOUD) {
          console.log("[INFRA] CLOUD mode - Launching lambda...")
          const lambdaStore = useLambdaStore()
          await lambdaStore.launch()
          console.log("[INFRA] Lambda launched successfully")
        }

        this.status = Status.CREATED
        console.log("[INFRA] Backend created successfully")
        return this.create_connection()
      })
    },
    async create_connection() {
      console.log("[INFRA] Starting create_connection")
      console.log(
        "[INFRA] Connecting microservices:",
        this.microservices.map((microservice) => microservice.store.$id),
      )

      const connection_promises = this.microservices.map((microservice) => {
        return microservice.connect(microservice.store).then(() => {
          console.log("[INFRA] Microservice connected:", microservice.store.$id)
        })
      })

      await Promise.all(connection_promises)
      console.log("[INFRA] All microservices connected")
      return
    },
  },
  share: {
    omit: ["microservices"],
  },
})
