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
      saveSelected: () => ({}),
      loadSelected: () => {},
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

  function saveSelected(storeIds = []) {
    if (!Array.isArray(storeIds) || storeIds.length === 0) {
      console.warn("[AppStore] saveSelected: no store IDs provided")
      return {}
    }

    const snapshot = {}
    const savedStores = []
    const notFoundStores = []

    for (const id of storeIds) {
      const rawState = pinia.state.value[id]

      if (rawState && Object.keys(rawState).length > 0) {
        snapshot[id] = JSON.parse(JSON.stringify(rawState))
        savedStores.push(id)
      } else {
        notFoundStores.push(id)
      }
    }

    if (notFoundStores.length > 0) {
      console.warn(
        `[AppStore] Stores not found or empty: ${notFoundStores.join(", ")}`,
      )
    }

    console.log(
      `[AppStore] Saved ${savedStores.length} selected stores: ${savedStores.join(", ")}`,
    )
    return snapshot
  }

  function loadSelected(snapshot, storeIds = null) {
    if (!snapshot || typeof snapshot !== "object") {
      console.warn("[AppStore] loadSelected: invalid snapshot")
      return
    }

    const storesById = getStoresById()
    const idsToLoad = storeIds || Object.keys(snapshot)
    const loadedStores = []
    const notFoundInSnapshot = []
    const notFoundInApp = []

    for (const id of idsToLoad) {
      if (!snapshot[id]) {
        notFoundInSnapshot.push(id)
        continue
      }

      const store = storesById[id]
      if (!store) {
        notFoundInApp.push(id)
        continue
      }

      store.$patch(snapshot[id])
      loadedStores.push(id)
    }

    if (notFoundInSnapshot.length > 0) {
      console.warn(
        `[AppStore] Stores not found in snapshot: ${notFoundInSnapshot.join(", ")}`,
      )
    }
    if (notFoundInApp.length > 0) {
      console.warn(
        `[AppStore] Stores not found in application: ${notFoundInApp.join(", ")}`,
      )
    }

    console.log(
      `[AppStore] Loaded ${loadedStores.length} selected stores: ${loadedStores.join(", ")}`,
    )
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
    saveSelected,
    loadSelected,
  }
}

export default useAppStore
