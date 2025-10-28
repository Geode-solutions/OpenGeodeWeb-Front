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

  function save() {
    const snapshot = {}
    let savedCount = 0

    for (const store of stores) {
      if (!store.save) {
        continue
      }
      const storeId = store.$id
      try {
        snapshot[storeId] = store.save()
        savedCount++
      } catch (error) {
        console.error(`[AppStore] Error saving store "${storeId}":`, error)
      }
    }

    console.log(`[AppStore] Saved ${savedCount} stores`)
    return snapshot
  }

  async function load(snapshot) {
    if (!snapshot) {
      console.warn("[AppStore] load called with invalid snapshot")
      return
    }

    let loadedCount = 0
    const notFoundStores = []

    for (const store of stores) {
      if (!store.load) continue

      const storeId = store.$id

      if (!snapshot[storeId]) {
        notFoundStores.push(storeId)
        continue
      }

      try {
        await store.load(snapshot[storeId])
        loadedCount++
      } catch (error) {
        console.error(`[AppStore] Error loading store "${storeId}":`, error)
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
    stores,
    registerStore,
    save,
    load,
  }
})
