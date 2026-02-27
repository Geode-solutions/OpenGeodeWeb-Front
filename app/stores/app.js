import { upload_file } from "../../internal/utils/upload_file.js"
import { api_fetch } from "../../internal/utils/api_fetch.js"

export const useAppStore = defineStore("app", () => {
  const stores = []

  function registerStore(store) {
    const isAlreadyRegistered = stores.some(
      (registeredStore) => registeredStore.$id === store.$id,
    )
    if (isAlreadyRegistered) {
      console.log(
        `[AppStore] Store "${store.$id}" already registered, skipping`,
      )
      return
    }
    console.log("[AppStore] Registering store", store.$id)
    stores.push(store)
  }

  async function exportStores(params = {}) {
    const snapshot = {}
    let exportCount = 0

    console.log(
      `[AppStore] Exporting stores, total registered: ${stores.length}`,
    )
    await Promise.all(
      stores.map(async (store) => {
        if (!store.exportStores) {
          return
        }
        const storeId = store.$id
        try {
          snapshot[storeId] = await store.exportStores(params)
          exportCount += 1
        } catch (error) {
          console.error(`[AppStore] Error exporting store "${storeId}":`, error)
        }
      }),
    )
    console.log(
      `[AppStore] Exported ${exportCount} stores; snapshot keys:`,
      Object.keys(snapshot),
    )
    return snapshot
  }

  async function importStores(snapshot) {
    if (!snapshot) {
      console.warn("[AppStore] import called with invalid snapshot")
      return
    }
    console.log("[AppStore] Import snapshot keys:", Object.keys(snapshot || {}))

    let importedCount = 0
    const notFoundStores = []
    await Promise.all(
      stores.map(async (store) => {
        if (!store.importStores) {
          return
        }
        const storeId = store.$id
        if (!snapshot[storeId]) {
          notFoundStores.push(storeId)
          return
        }
        try {
          await store.importStores(snapshot[storeId])
          importedCount += 1
        } catch (error) {
          console.error(`[AppStore] Error importing store "${storeId}":`, error)
        }
      }),
    )
    if (notFoundStores.length > 0) {
      console.warn(
        `[AppStore] Stores not found in snapshot: ${notFoundStores.join(", ")}`,
      )
    }
    console.log(`[AppStore] Imported ${importedCount} stores`)
  }

  const loadedExtensions = ref(new Map())
  const extensionAPI = ref(undefined)
  const codeTransformer = ref(undefined)

  function setExtensionAPI(api) {
    extensionAPI.value = api
  }

  function setCodeTransformer(transformer) {
    codeTransformer.value = transformer
  }

  function getExtension(id) {
    return loadedExtensions.value.get(id)
  }

  async function loadExtension(path, backendPath = undefined) {
    try {
      let finalURL = path

      if (codeTransformer.value && path.startsWith("blob:")) {
        const response = await fetch(path)
        const code = await response.text()
        const transformedCode = codeTransformer.value(code)

        const newBlob = new Blob([transformedCode], {
          type: "application/javascript",
        })
        finalURL = URL.createObjectURL(newBlob)
      }
      const extensionModule = await import(/* @vite-ignore */ finalURL)

      if (finalURL !== path && finalURL.startsWith("blob:")) {
        URL.revokeObjectURL(finalURL)
      }

      if (!extensionModule.metadata?.id) {
        throw new Error("Extension must have metadata.id")
      }

      const extensionId = extensionModule.metadata.id

      if (loadedExtensions.value.has(extensionId)) {
        console.warn(`[AppStore] Extension "${extensionId}" is already loaded`)
        throw new Error(`Extension "${extensionId}" is already loaded.`)
      }

      if (!extensionAPI.value) {
        throw new Error("Extension API not initialized")
      }

      if (typeof extensionModule.install === "function") {
        await extensionModule.install(extensionAPI.value, backendPath)

        const extensionData = {
          module: extensionModule,
          id: extensionId,
          path,
          backendPath,
          loadedAt: new Date().toISOString(),
          metadata: extensionModule.metadata,
          enabled: true,
        }
        loadedExtensions.value.set(extensionId, extensionData)

        console.log(`[AppStore] Extension loaded successfully: ${extensionId}`)
        return extensionModule
      } else {
        throw new Error("Extension must export an install function")
      }
    } catch (error) {
      console.error(`[AppStore] Failed to load extension from ${path}:`, error)
      throw error
    }
  }

  function getLoadedExtensions() {
    return [...loadedExtensions.value.values()]
  }

  function unloadExtension(id) {
    const extensionData = getExtension(id)
    if (!extensionData) {
      return false
    }
    if (
      extensionData.module &&
      typeof extensionData.module.uninstall === "function"
    ) {
      try {
        extensionData.module.uninstall(extensionAPI.value)
        console.log(`[AppStore] Extension uninstall called: ${id}`)
      } catch (error) {
        console.error(`[AppStore] Error calling uninstall for ${id}:`, error)
      }
    }

    if (
      extensionAPI.value &&
      typeof extensionAPI.value.unregisterToolsByExtension === "function"
    ) {
      extensionAPI.value.unregisterToolsByExtension(id)
    }

    loadedExtensions.value.delete(id)
    console.log(`[AppStore] Extension unloaded: ${id}`)
    return true
  }

  function toggleExtension(id) {
    const extensionData = getExtension(id)
    if (!extensionData) {
      return false
    }
    extensionData.enabled = !extensionData.enabled
    console.log(
      `[AppStore] Extension ${extensionData.enabled ? "enabled" : "disabled"}: ${id}`,
    )
    return extensionData.enabled
  }

  function setExtensionEnabled(id, enabled) {
    const extensionData = getExtension(id)
    if (!extensionData) {
      return false
    }
    extensionData.enabled = enabled
    console.log(
      `[AppStore] Extension ${enabled ? "enabled" : "disabled"}: ${id}`,
    )
    return true
  }

  function getExtensionEnabled(id) {
    return getExtension(id)?.enabled ?? false
  }

  function upload(file, callbacks = {}) {
    const route = "/api/extensions"
    return upload_file(
      this,
      { route, file },
      {
        ...callbacks,
        response_function: async (response) => {
          console.log("[APP] Request completed:", route)
          if (callbacks.response_function) {
            await callbacks.response_function(response)
          }
        },
      },
    )
  }

  function request(schema, params, callbacks = {}) {
    console.log("[APP] Request:", schema.$id)

    const store = useAppStore()
    return api_fetch(
      store,
      { schema, params },
      {
        ...callbacks,
        response_function: async (response) => {
          console.log("[APP] Request completed:", schema.$id)
          if (callbacks.response_function) {
            await callbacks.response_function(response)
          }
        },
      },
    )
  }

  const request_counter = ref(0)
  function start_request() {
    request_counter.value += 1
  }
  function stop_request() {
    request_counter.value -= 1
  }

  const projectFolderPath = ref("")
  function createProjectFolder() {
    const { PROJECT } = useRuntimeConfig().public
    const schema = {
      $id: "/api/app/project_folder_path",
      methods: ["POST"],
      type: "object",
      properties: {
        PROJECT: { type: "string" },
      },
      required: ["PROJECT"],
      additionalProperties: false,
    }

    console.log(createProjectFolder.name, { PROJECT })

    return request(
      schema,
      { PROJECT },
      {
        response_function: (response) => {
          console.log("[GEODE] Request completed:", { response })
          projectFolderPath.value = response.projectFolderPath
          console.log("[GEODE] Back launched")
        },
      },
    )
  }

  return {
    stores,
    registerStore,
    exportStores,
    importStores,
    loadedExtensions,
    extensionAPI,
    setExtensionAPI,
    setCodeTransformer,
    loadExtension,
    getLoadedExtensions,
    getExtension,
    unloadExtension,
    toggleExtension,
    setExtensionEnabled,
    getExtensionEnabled,
    request,
    upload,
    projectFolderPath,
    createProjectFolder,
    start_request,
    stop_request,
  }
})
