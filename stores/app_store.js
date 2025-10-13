function getAllStores() {
  const pinia = getActivePinia()
  if (!pinia) return {}

  const map = {}
  const storeMap = pinia._s

  storeMap.forEach((store, id) => {
    map[id] = store
  })
  return map
}

export function useAppStore() {
  const pinia = getActivePinia()

  function getStoresById() {
    return getAllStores()
  }

  function getStoreIds() {
    return Object.keys(getStoresById())
  }

  const storesById = instantiateStores()
  const allIds = Object.keys(storesById)

  // Save state of all stores to snapshot
  function saveAll() {
    const snapshot = {}
    const storesById = getStoresById()
    const allIds = getStoreIds()

    for (const id of allIds) {
      const rawState = pinia.state.value[id] ?? {}
      snapshot[id] = JSON.parse(JSON.stringify(rawState))
    }
    return snapshot
  }

  // Reload state of all stores from snapshot
  function loadAll(snapshot) {
    const storesById = getStoresById()

    for (const id of Object.keys(snapshot)) {
      const store = storesById[id]
      if (!store) continue
      const incoming = snapshot[id] ?? {}
      store.$patch(incoming)
    }
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
