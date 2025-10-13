import { getActivePinia } from "pinia"

function getAllStores() {
  const pinia = getActivePinia()
  if (!pinia) return {}

  const map = {}
  pinia._s.forEach((store, id) => {
    if (id !== "appStore") {
      map[id] = store
    }
  })
  return map
}

export function useAppStore() {
  const pinia = getActivePinia()
  if (!pinia) {
    return {
      stores: {},
      storeIds: [],
      saveAll: () => ({}),
      loadAll: () => {},
    }
  }

  function getStoresById() {
    return getAllStores()
  }

  function getStoreIds() {
    return Object.keys(getStoresById())
  }

  function saveAll() {
    const snapshot = {}
    const allIds = getStoreIds()

    for (const id of allIds) {
      const rawState = pinia.state.value[id] ?? {}
      snapshot[id] = JSON.parse(JSON.stringify(rawState))
    }

    console.log(`[AppStore] Saved ${allIds.length} stores`)
    return snapshot
  }

  function loadAll(snapshot) {
    if (!snapshot || typeof snapshot !== "object") {
      console.warn("[AppStore] loadAll called with invalid snapshot")
      return
    }

    const storesById = getStoresById()

    for (const id of Object.keys(snapshot)) {
      const store = storesById[id]
      if (!store) {
        console.warn(`[AppStore] Store "${id}" not found`)
        continue
      }
      const incoming = snapshot[id] ?? {}
      store.$patch(incoming)
    }

    console.log("[AppStore] Snapshot loaded")
  }

  return {
    get stores() {
      return getStoresById()
    },
    get storeIds() {
      return getStoreIds()
    },
    saveAll,
    loadAll,
  }
}

export default useAppStore
