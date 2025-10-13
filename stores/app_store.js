import { getActivePinia } from "pinia"
import { ref } from "vue"

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
      actionHistory: [],
      saveAll: () => ({}),
      loadAll: () => {},
      trackActions: () => {},
      clearHistory: () => {},
      getHistory: () => [],
    }
  }

  const actionHistory = ref([])
  const maxHistorySize = 100

  function getStoresById() {
    return getAllStores()
  }

  function getStoreIds() {
    return Object.keys(getStoresById())
  }

  function addToHistory(entry) {
    actionHistory.value.push({
      ...entry,
      timestamp: new Date().toISOString(),
    })

    if (actionHistory.value.length > maxHistorySize) {
      actionHistory.value.shift()
    }
  }

  function trackActions(storeId = null) {
    const storesById = getStoresById()
    const storesToTrack = storeId
      ? [storesById[storeId]]
      : Object.values(storesById)

    storesToTrack.forEach((store) => {
      if (!store) return

      const originalActions = {}

      Object.keys(store).forEach((key) => {
        if (typeof store[key] === "function" && !key.startsWith("$")) {
          originalActions[key] = store[key]

          store[key] = function (...args) {
            const entry = {
              storeId: store.$id,
              action: key,
              params: args,
            }

            addToHistory(entry)
            console.log(`[AppStore] ${store.$id}.${key}()`, args)

            return originalActions[key].apply(this, args)
          }
        }
      })
    })

    console.log(
      `[AppStore] Tracking enabled for ${storesToTrack.length} store(s)`,
    )
  }

  function clearHistory() {
    actionHistory.value = []
    console.log("[AppStore] History cleared")
  }

  function getHistory(filters = {}) {
    let filtered = actionHistory.value

    if (filters.storeId) {
      filtered = filtered.filter((entry) => entry.storeId === filters.storeId)
    }

    if (filters.action) {
      filtered = filtered.filter((entry) => entry.action === filters.action)
    }

    if (filters.since) {
      const sinceDate = new Date(filters.since)
      filtered = filtered.filter(
        (entry) => new Date(entry.timestamp) >= sinceDate,
      )
    }

    return filtered
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
    actionHistory,
    saveAll,
    loadAll,
    trackActions,
    clearHistory,
    getHistory,
  }
}

export default useAppStore
