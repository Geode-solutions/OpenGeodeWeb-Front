import { useStorage } from "@vueuse/core"
import Status from "@ogw_front/utils/status.js"
import { appMode, getAppMode } from "@ogw_front/utils/app_mode.js"

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
    async init_microservices() {
      if (this.microservices.length > 0) return

      console.log("[INFRA] Initializing microservices...")

      // Import and register microservices
      const { useGeodeStore, geode_request, geode_connect, geode_launch } =
        await import("@ogw_front/stores/geode.js")
      const { useViewerStore, viewer_request, viewer_connect, viewer_launch } =
        await import("@ogw_front/stores/viewer.js")

      const geode_store = useGeodeStore()
      this.register_microservice(geode_store, {
        request: geode_request,
        connect: geode_connect,
        launch: geode_launch,
      })

      const viewer_store = useViewerStore()
      this.register_microservice(viewer_store, {
        request: viewer_request,
        connect: viewer_connect,
        launch: viewer_launch,
      })

      if (this.app_mode === appMode.CLOUD) {
        const { useLambdaStore } = await import("@ogw_front/stores/lambda.js")
        const lambda_store = useLambdaStore()
        this.register_microservice(lambda_store, {
          request: () => {
            throw new Error("Lambda does not handle requests")
          },
          connect: (store) => store.connect(),
          launch: () => lambda_store.launch(),
        })
      }

      console.log("[INFRA] Microservices initialized")
    },
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
      // Initialize microservices first
      await this.init_microservices()

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
          const lambda_microservice = this.microservices.find(
            (microservice) => microservice.store.$id === "lambda",
          )
          if (lambda_microservice) {
            await lambda_microservice.launch()
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
