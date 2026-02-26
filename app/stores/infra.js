import { appMode, getAppMode } from "@ogw_front/utils/app_mode"
import Status from "@ogw_front/utils/status"
import { useLambdaStore } from "@ogw_front/stores/lambda"

export const useInfraStore = defineStore("infra", {
  state: () => ({
    app_mode: getAppMode(),
    ID: "",
    is_captcha_validated: false,
    status: Status.NOT_CREATED,
    microservices: [],
  }),
  getters: {
    domain_name() {
      if (this.app_mode === appMode.CLOUD) {
        return useRuntimeConfig().public.API_URL
      }
      return "localhost"
    },
    microservices_connected() {
      console.log("microservices", this.microservices)
      return this.microservices.every(
        (store) => store.status === Status.CONNECTED,
      )
    },
    microservices_busy() {
      return this.microservices.some((store) => store.is_busy === true)
    },
  },
  actions: {
    register_microservice(store) {
      const store_name = store.$id
      console.log("[INFRA] Registering microservice:", store_name)

      if (!this.microservices.find((store) => store.$id === store_name)) {
        this.microservices.push(store)
        console.log("[INFRA] Microservice registered:", store_name)
      }
    },
    async create_backend() {
      console.log("[INFRA] Starting create_backend - Mode:", this.app_mode)
      console.log(
        "[INFRA] Registered microservices:",
        this.microservices.map((store) => store.$id),
      )

      if (this.status === Status.CREATED) {
        return
      }

      return navigator.locks.request("infra.create_backend", async () => {
        this.status = Status.CREATING
        if (this.status === Status.CREATED) {
          return
        }
        console.log("[INFRA] Lock granted for create_backend")

        if (this.app_mode === appMode.CLOUD) {
          console.log("[INFRA] CLOUD mode - Launching lambda...")
          const lambdaStore = useLambdaStore()
          this.ID = await lambdaStore.launch()
          console.log("[INFRA] Lambda launched successfully")
        } else {
          console.log(
            `[INFRA] ${this.app_mode} mode - Launching microservices...`,
          )
          const microservices_with_launch = this.microservices.filter(
            (store) => store.launch,
          )

          const port_promises = microservices_with_launch.map((store) =>
            store.launch(),
          )
          const ports = await Promise.all(port_promises)

          for (const [index, store] of microservices_with_launch.entries()) {
            store.$patch({ default_local_port: ports[index] })
          }
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
        this.microservices.map((store) => store.$id),
      )

      await Promise.all(
        this.microservices.map(async (store) => {
          await store.connect()
          console.log("[INFRA] Microservice connected:", store.$id)
        }),
      )
      console.log("[INFRA] All microservices connected")
    },
  },
  share: {
    omit: ["microservices"],
  },
})
