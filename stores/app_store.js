// Regroupe tous les stores et expose save/load pour snapshot global

import { getActivePinia } from "pinia"

// Import des stores existants
import { useDataBaseStore } from "./data_base.js"
import { useDataStyleStore } from "./data_style.js"
import { useFeedbackStore } from "./feedback.js"
import { useGeodeStore } from "./geode.js"
import { useHybridViewerStore } from "./hybrid_viewer.js"
import { useInfraStore } from "./infra.js"
import { useMenuStore } from "./menu.js"
import { useTreeviewStore } from "./treeview.js"
import { useViewerStore } from "./viewer.js"

// Instantiate all stores to ensure they are present in Pinia
function instantiateStores() {
  const dataBase = useDataBaseStore()
  const dataStyle = useDataStyleStore()
  const feedback = useFeedbackStore()
  const geode = useGeodeStore()
  const hybridViewer = useHybridViewerStore()
  const infra = useInfraStore()
  const menu = useMenuStore()
  const treeview = useTreeviewStore()
  const viewer = useViewerStore()

  // Use map to store stores by id
  const map = {}
  ;[
    dataBase,
    dataStyle,
    feedback,
    geode,
    hybridViewer,
    infra,
    menu,
    treeview,
    viewer,
  ].forEach((s) => {
    map[s.$id] = s
  })
  return map
}

export function useAppStore() {
  const pinia = getActivePinia()
  const storesById = instantiateStores()
  const allIds = Object.keys(storesById)

  // Save state of all stores to snapshot
  function saveAll() {
    const snapshot = {}
    for (const id of allIds) {
      const rawState = pinia.state.value[id] ?? {}
      snapshot[id] = JSON.parse(JSON.stringify(rawState))
    }
    return snapshot
  }

  // Reload state of all stores from snapshot
  function loadAll(snapshot) {
    for (const id of Object.keys(snapshot)) {
      const store = storesById[id]
      if (!store) continue
      const incoming = snapshot[id] ?? {}
      store.$patch(incoming)
    }
  }

  return {
    stores: storesById,
    storeIds: allIds,
    saveAll,
    loadAll,
  }
}
