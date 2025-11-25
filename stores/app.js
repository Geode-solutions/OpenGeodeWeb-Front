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

  // Extension loading system
  const loadedExtensions = ref(new Map())
  const extensionAPI = ref(null)

  function setExtensionAPI(api) {
    extensionAPI.value = api
  }

  async function loadExtension(path) {
    try {
      // Check if already loaded
      if (loadedExtensions.value.has(path)) {
        console.warn(`[AppStore] Extension already loaded: ${path}`)
        return loadedExtensions.value.get(path)
      }

      if (!extensionAPI.value) {
        throw new Error("Extension API not initialized")
      }

      let finalURL = path

      // For blob URLs, we need to rewrite imports to use available modules
      if (path.startsWith('blob:')) {
        const response = await fetch(path)
        let code = await response.text()

        // Replace Vue imports - handle all patterns including multiline
        code = code.replace(
          /import\s+(?:{([^}]+)}|\*\s+as\s+(\w+)|(\w+))\s+from\s+["']vue["'];?/gs,
          (match, namedImports, namespaceImport, defaultImport) => {
            if (namedImports) {
              // Named imports: import { ref, computed } from 'vue'
              // Convert 'as' to ':' for object destructuring
              const converted = namedImports.replace(/\s+as\s+/g, ': ')
              return `const {${converted}} = window.__VUE_RUNTIME__;`
            } else if (namespaceImport) {
              // Namespace import: import * as Vue from 'vue'
              return `const ${namespaceImport} = window.__VUE_RUNTIME__;`
            } else if (defaultImport) {
              // Default import: import Vue from 'vue'
              return `const ${defaultImport} = window.__VUE_RUNTIME__;`
            }
            return match
          }
        )
        
        // Replace Pinia imports
        code = code.replace(
          /import\s+(?:{([^}]+)}|\*\s+as\s+(\w+)|(\w+))\s+from\s+["']pinia["'];?/gs,
          (match, namedImports, namespaceImport, defaultImport) => {
            if (namedImports) {
              const converted = namedImports.replace(/\s+as\s+/g, ': ')
              return `const {${converted}} = window.__PINIA__;`
            } else if (namespaceImport) {
              return `const ${namespaceImport} = window.__PINIA__;`
            } else if (defaultImport) {
              return `const ${defaultImport} = window.__PINIA__;`
            }
            return match
          }
        )

        // Replace @geode/* imports - just comment them out for now
        code = code.replace(
          /import\s+[^;]+from\s+["']@geode\/[^"']+["'];?/gs,
          (match) => `/* ${match} */ // External dependency - resolved at runtime\n`
        )

        // Replace @ogw_* imports
        code = code.replace(
          /import\s+[^;]+from\s+["']@ogw_[^"']+["'];?/gs,
          (match) => `/* ${match} */ // External dependency - resolved at runtime\n`
        )

        console.log('[AppStore] Rewritten extension code preview:', code.substring(0, 800))

        // Create new blob with rewritten code
        const newBlob = new Blob([code], { type: 'application/javascript' })
        finalURL = URL.createObjectURL(newBlob)
      }

      // Dynamic import of the extension module
      const extensionModule = await import(/* @vite-ignore */ finalURL)

      // Clean up temporary blob URL
      if (finalURL !== path && finalURL.startsWith('blob:')) {
        URL.revokeObjectURL(finalURL)
      }

      // Check if extension has an install function
      if (typeof extensionModule.install === 'function') {
        // Call install with the Extension API
        await extensionModule.install(extensionAPI.value)
        
        // Store the loaded extension
        const extensionData = {
          module: extensionModule,
          path,
          loadedAt: new Date().toISOString(),
        }
        loadedExtensions.value.set(path, extensionData)

        console.log(`[AppStore] Extension loaded successfully: ${path}`)

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

  function unloadExtension(path) {
    if (loadedExtensions.value.has(path)) {
      loadedExtensions.value.delete(path)
      console.log(`[AppStore] Extension unloaded: ${path}`)
      return true
    }
    return false
  }

  return {
    stores,
    registerStore,
    exportStores,
    importStores,
    loadedExtensions,
    setExtensionAPI,
    loadExtension,
    getLoadedExtensions,
    unloadExtension,
  }
})
