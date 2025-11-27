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
        (microservice) => microservice.store.status === Status.CONNECTED,
      )
    },
    microservices_busy() {
      return this.microservices.some(
        (microservice) => microservice.store.is_busy === true,
      )
    },
  },
  actions: {
    register_microservice(config) {
      // config should have:
      // - name: string
      // - useStore: function that returns the store instance
      // - request: function(store, schema, params, callbacks) - for making requests
      // - connect: function(store) - for establishing connection
      // - launch: function(store) [optional] - for CLOUD mode launching
      // - electron_runner: string [optional] - for DESKTOP mode launching
      console.log(`[INFRA] Registering microservice: ${config.name}`, {
        has_request: !!config.request,
        has_connect: !!config.connect,
        has_launch: !!config.launch,
        electron_runner: config.electron_runner,
      })
      if (
        !this.microservices.find(
          (microservice) => microservice.name === config.name,
        )
      ) {
        this.microservices.push({
          name: config.name,
          store: config.useStore(),
          request: config.request,
          connect: config.connect,
          launch: config.launch,
          electron_runner: config.electron_runner,
        })
        console.log(`[INFRA] Microservice registered: ${config.name}`)
      } else {
        console.log(`[INFRA] Microservice already registered: ${config.name}`)
      }
    },
    get_microservice(name) {
      const microservice = this.microservices.find(
        (microservice) => microservice.name === name,
      )
      return microservice
    },
    get_microservice_store(name) {
      const microservice = this.get_microservice(name)
      return microservice ? microservice.store : null
    },
    async create_backend() {
      console.log(`[INFRA] Starting create_backend - Mode: ${this.app_mode}`)
      console.log(`[INFRA] Registered microservices:`, this.microservices.map(m => m.name))
      if (this.status === Status.CREATED) {
        console.log("[INFRA] Backend already created, skipping")
        return
      }
      return navigator.locks.request("infra.create_backend", async (lock) => {
        this.status = Status.CREATING
        if (this.status === Status.CREATED) return
        console.log("[INFRA] Lock granted for create_backend")
        if (this.app_mode == appMode.DESKTOP) {
          console.log("[INFRA] DESKTOP mode - Launching microservices via Electron")
          const microservices_with_runner = this.microservices.filter((m) => m.electron_runner)
          console.log(`[INFRA] Microservices to launch:`, microservices_with_runner.map(m => `${m.name} (${m.electron_runner})`))
          
          const port_promises = microservices_with_runner.map((microservice) => {
            console.log(`[INFRA] Calling ${microservice.electron_runner} for ${microservice.name}`)
            return window.electronAPI[microservice.electron_runner]()
          })
          const ports = await Promise.all(port_promises)
          console.log(`[INFRA] All microservices launched, ports:`, ports)
          
          let port_index = 0
          this.microservices.forEach((microservice) => {
            if (microservice.electron_runner) {
              console.log(`[INFRA] Setting port ${ports[port_index]} for ${microservice.name}`)
              microservice.store.$patch({ default_local_port: ports[port_index] })
              port_index++
            }
          })
        } else if (this.app_mode == appMode.CLOUD) {
          console.log("[INFRA] CLOUD mode - Launching microservices via launch()")
          const microservices_with_launch = this.microservices.filter((m) => m.launch)
          console.log(`[INFRA] Microservices to launch:`, microservices_with_launch.map(m => m.name))
          
          const launch_promises = microservices_with_launch.map((microservice) => {
            console.log(`[INFRA] Launching ${microservice.name}`)
            return microservice.launch(microservice.store)
          })
          
          try {
            await Promise.all(launch_promises)
            console.log(`[INFRA] All microservices launched successfully`)
          } catch (error) {
            this.status = Status.NOT_CREATED
            const feedback_store = useFeedbackStore()
            feedback_store.server_error = true
            console.error("[INFRA] Failed to launch microservices:", error)
            return
          }
        }
        this.status = Status.CREATED
        console.log("[INFRA] Backend created, proceeding to connection")
        return this.create_connection()
      })
    },
    async create_connection() {
      console.log("[INFRA] Starting create_connection")
      console.log(`[INFRA] Connecting ${this.microservices.length} microservices:`, this.microservices.map(m => m.name))
      
      const connection_promises = this.microservices.map((microservice) => {
        console.log(`[INFRA] Connecting to ${microservice.name}...`)
        return microservice.connect(microservice.store)
          .then(() => {
            console.log(`[INFRA] ${microservice.name} connected successfully`)
          })
          .catch((error) => {
            console.error(`[INFRA] ${microservice.name} connection failed:`, error)
            throw error
          })
      })
      
      await Promise.all(connection_promises)
      console.log("[INFRA] All microservices connected")
      return
    },
  },
  share: {
    omit: ["status", "microservices"],
  },
})
