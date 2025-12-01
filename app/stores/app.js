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

  function exportStores() {
    const snapshot = {}
    let exportCount = 0

    for (const store of stores) {
      if (!store.exportStores) continue
      const storeId = store.$id
      try {
        snapshot[storeId] = store.exportStores()
        exportCount++
      } catch (error) {
        console.error(`[AppStore] Error exporting store "${storeId}":`, error)
      }
    }
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
    for (const store of stores) {
      if (!store.importStores) continue
      const storeId = store.$id
      if (!snapshot[storeId]) {
        notFoundStores.push(storeId)
        continue
      }
      try {
        await store.importStores(snapshot[storeId])
        importedCount++
      } catch (error) {
        console.error(`[AppStore] Error importing store "${storeId}":`, error)
      }
    }
    if (notFoundStores.length > 0) {
      console.warn(
        `[AppStore] Stores not found in snapshot: ${notFoundStores.join(", ")}`,
      )
    }
    console.log(`[AppStore] Imported ${importedCount} stores`)
  }

  const loadedExtensions = ref(new Map())
  const extensionAPI = ref(null)
  const codeTransformer = ref(null)

  function setExtensionAPI(api) {
    extensionAPI.value = api
  }

  function setCodeTransformer(transformer) {
    codeTransformer.value = transformer
  }

  function getExtension(id) {
    return loadedExtensions.value.get(id)
  }

  async function loadExtension(path) {
    try {
      let finalURL = path

      if (codeTransformer.value && path.startsWith('blob:')) {
        const response = await fetch(path)
        const code = await response.text()
        const transformedCode = codeTransformer.value(code)

        const newBlob = new Blob([transformedCode], { type: 'application/javascript' })
        finalURL = URL.createObjectURL(newBlob)
      }

      const extensionModule = await import(finalURL)

      if (finalURL !== path && finalURL.startsWith('blob:')) {
        URL.revokeObjectURL(finalURL)
      }

      if (!extensionModule.metadata?.id) {
        throw new Error('Extension must have metadata.id')
      }

      const extensionId = extensionModule.metadata.id

      if (loadedExtensions.value.has(extensionId)) {
        console.warn(`[AppStore] Extension "${extensionId}" is already loaded`)
        throw new Error(`Extension "${extensionId}" is already loaded.`)
      }

      if (!extensionAPI.value) {
        throw new Error("Extension API not initialized")
      }

      if (typeof extensionModule.install === 'function') {
        await extensionModule.install(extensionAPI.value, extensionId)
        
        const extensionData = {
          module: extensionModule,
          id: extensionId,
          path,
          loadedAt: new Date().toISOString(),
          metadata: extensionModule.metadata,
          enabled: true,
        }
        loadedExtensions.value.set(extensionId, extensionData)

        console.log(`[AppStore] Extension loaded successfully: ${extensionId}`)

        return extensionModule
      } else {
        throw new Error('Extension must export an install function')
      }
    } catch (error) {
      console.error(`[AppStore] Failed to load extension from ${path}:`, error)
      throw error
    }
  }

  function getLoadedExtensions() {
    return Array.from(loadedExtensions.value.values())
  }

  function unloadExtension(id) {
    const extensionData = getExtension(id)
    if (!extensionData) return false
    
    if (extensionData.module && typeof extensionData.module.uninstall === 'function') {
      try {
        extensionData.module.uninstall(extensionAPI.value)
        console.log(`[AppStore] Extension uninstall called: ${id}`)
      } catch (error) {
        console.error(`[AppStore] Error calling uninstall for ${id}:`, error)
      }
    }
    
    if (extensionAPI.value && typeof extensionAPI.value.unregisterToolsByExtension === 'function') {
      extensionAPI.value.unregisterToolsByExtension(id)
    }
    
    loadedExtensions.value.delete(id)
    console.log(`[AppStore] Extension unloaded: ${id}`)
    return true
  }

  function toggleExtension(id) {
    const extensionData = getExtension(id)
    if (!extensionData) return false
    
    extensionData.enabled = !extensionData.enabled
    console.log(`[AppStore] Extension ${extensionData.enabled ? 'enabled' : 'disabled'}: ${id}`)
    return extensionData.enabled
  }

  function setExtensionEnabled(id, enabled) {
    const extensionData = getExtension(id)
    if (!extensionData) return false
    
    extensionData.enabled = enabled
    console.log(`[AppStore] Extension ${enabled ? 'enabled' : 'disabled'}: ${id}`)
    return true
  }

  function getExtensionEnabled(id) {
    return getExtension(id)?.enabled ?? false
  }

  return {
    stores,
    registerStore,
    exportStores,
    importStores,
    loadedExtensions,
    setExtensionAPI,
    setCodeTransformer,
    loadExtension,
    getLoadedExtensions,
    unloadExtension,
    toggleExtension,
    setExtensionEnabled,
    getExtensionEnabled,
  }
})
