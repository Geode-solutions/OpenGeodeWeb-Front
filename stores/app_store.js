export const useAppStore = defineStore("appStore", () => {
  const stores = []

  function registerStore(store) {
    stores.push(store)
  }

  function save() {
    const snapshot = {}
    let savedCount = 0

    for (const store of stores) {
      if (typeof store.save === "function") {
        const storeId = store.$id
        try {
          snapshot[storeId] = store.save()
          savedCount++
        } catch (error) {
          console.error(`[AppStore] Error saving store "${storeId}":`, error)
        }
      }
    }

    console.log(`[AppStore] Saved ${savedCount} stores`)
    return snapshot
  }

  function load(snapshot) {
    if (!snapshot || typeof snapshot !== "object") {
      console.warn("[AppStore] load called with invalid snapshot")
      return
    }

    let loadedCount = 0
    const notFoundStores = []

    for (const store of stores) {
      const storeId = store.$id

      if (typeof store.load === "function") {
        if (snapshot[storeId]) {
          try {
            store.load(snapshot[storeId])
            loadedCount++
          } catch (error) {
            console.error(`[AppStore] Error loading store "${storeId}":`, error)
          }
        } else {
          notFoundStores.push(storeId)
        }
      }
    }

    if (notFoundStores.length > 0) {
      console.warn(
        `[AppStore] Stores not found in snapshot: ${notFoundStores.join(", ")}`,
      )
    }

    console.log(`[AppStore] Loaded ${loadedCount} stores`)
  }

  return {
    registerStore,
    stores,
    save,
    load,
  }
})
