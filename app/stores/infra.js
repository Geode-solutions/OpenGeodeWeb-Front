import { appMode, getAppMode } from "@ogw_front/utils/app_mode"
import { Status } from "@ogw_front/utils/status"
import { useAppStore } from "@ogw_front/stores/app"
import { useCloudStore } from "@ogw_front/stores/cloud"

import { registerRunningExtensions } from "@ogw_front/utils/extension"

export const useInfraStore = defineStore("infra", {
  state: () => ({
    app_mode: getAppMode(),
    status: Status.NOT_CREATED,
    microservices: [],
    domain_name: "localhost",
  }),
  getters: {
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

      if (
        !this.microservices.find(
          (microservice) => microservice.$id === store_name,
        )
      ) {
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
        if (this.status === Status.CREATED) {
          return
        }
        this.status = Status.CREATING
        console.log("[INFRA] Lock granted for create_backend")
        if (this.app_mode === appMode.CLOUD) {
          const cloudStore = useCloudStore()
          await cloudStore.launch()
        } else {
          const appStore = useAppStore()
          await appStore.createProjectFolder()
          if (this.app_mode === appMode.DESKTOP) {
            globalThis.electronAPI.project_folder_path({
              projectFolderPath: appStore.projectFolderPath,
            })
          }
          const microservices_with_launch = this.microservices.filter(
            (store) => store.launch,
          )
          const launch_promises = microservices_with_launch.map((store) =>
            store.launch({ projectFolderPath: appStore.projectFolderPath }),
          )
          launch_promises.push(registerRunningExtensions())
          await Promise.all(launch_promises)
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
