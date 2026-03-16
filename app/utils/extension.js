// Node.js imports

// Third party imports
import _ from "lodash"
import { useRuntimeConfig } from "nuxt/app"

// Local imports
import { useAppStore } from "@ogw_front/stores/app"
import { useInfraStore } from "@ogw_front/stores/infra"

async function importExtensionFile(file) {
  await uploadExtension(file)
  return registerRunningExtensions()
}

async function registerRunningExtensions() {
  const appStore = useAppStore()
  const infraStore = useInfraStore()
  const { extensionsArray } = await runExtensions()

  return Promise.all(
    extensionsArray.map(async (extension) => {
      const { name, version, frontendContent, port } = extension
      const blob = new Blob([frontendContent], {
        type: "application/javascript",
      })
      const blobUrl = URL.createObjectURL(blob)
      const extensionModule = await appStore.loadExtension(blobUrl)
      console.log("[ExtensionManager] Extension loaded:", id)

      if (extensionModule.metadata?.store) {
        const storeFactory = extensionModule.metadata.store
        const store = storeFactory()
        store.$patch((state) => {
          state.default_local_port = port
        })
        appStore.registerStore(store)
        console.log("[ExtensionManager] Store registered:", store.$id)
        await store.connect()
        console.log("[ExtensionManager] Microservice connected:", store.$id)
        infraStore.register_microservice(store)
      }
      return {
        name,
        version,
        extensionModule,
      }
    }),
  )
}

async function unloadExtension(extensionId) {
  const appStore = useAppStore()
  console.log("[ExtensionManager] Unloading extension:", extensionId)

  const extensionData = appStore.getExtension(extensionId)
  if (!extensionData) {
    console.warn("[ExtensionManager] Extension not found:", extensionId)
    return false
  }

  // Get the store if it exists
  const storeFactory = extensionData.metadata?.store
  if (storeFactory) {
    const store = storeFactory()
    // Stop the microservice if possible
    if (typeof store.kill === "function") {
      await store.kill()
    }
  }

  // Unload from AppStore
  appStore.unloadExtension(extensionId)

  console.log("[ExtensionManager] Extension unloaded:", extensionId)
  return true
}

async function uploadExtension(file) {
  const appStore = useAppStore()
  await appStore.upload(file)
}

function runExtensions() {
  const appStore = useAppStore()
  const { projectFolderPath } = appStore
  const { PROJECT: projectName } = useRuntimeConfig().public
  const params = { projectFolderPath, projectName }

  const schema = {
    $id: "/api/extensions/run",
    methods: ["POST"],
    type: "object",
    properties: {
      projectFolderPath: { type: "string" },
      projectName: { type: "string" },
    },
    required: ["projectFolderPath", "projectName"],
    additionalProperties: false,
  }

  return appStore.request(schema, params)
}

export {
  importExtensionFile,
  unloadExtension,
  uploadExtension,
  registerRunningExtensions,
  runExtensions,
}
