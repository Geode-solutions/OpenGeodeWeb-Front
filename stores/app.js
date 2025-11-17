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

  return {
    stores,
    registerStore,
    exportStores,
    importStores,
  }
})
