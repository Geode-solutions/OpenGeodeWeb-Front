import { useAppStore } from "@/stores/app_store.js"

async function autoInitializeStores() {
  const storeModules = import.meta.glob("@/stores/*.js", { eager: true })
  const initialized = []

  for (const [path, module] of Object.entries(storeModules)) {
    const fileName = path.split("/").pop().replace(".js", "")

    if (fileName === "app_store") continue

    try {
      const storeComposable = Object.values(module).find(
        (exp) => typeof exp === "function" && exp.name?.startsWith("use"),
      )

      if (storeComposable) {
        const store = storeComposable()
        initialized.push(store.$id)
      }
    } catch (error) {
      console.warn(`Error auto-initializing ${fileName}:`, error.message)
    }
  }

  return initialized
}

function exposeDebugHelpers(appStore) {
  window.__appStore = appStore

  window.__saveAll = () => {
    const snapshot = appStore.saveAll()
    console.log("Snapshot :", snapshot)
    console.log("Store IDs :", appStore.storeIds)
    return snapshot
  }

  window.__loadAll = (snapshot) => {
    const result = appStore.loadAll(snapshot)
    console.log("Load Result :", result)
    return result
  }

  window.__listStores = () => {
    const ids = appStore.storeIds
    console.log(`${ids.length} stores registered:`)

    ids.forEach((id) => {
      const store = appStore.stores[id]
      if (store) {
        const stateKeys = Object.keys(store.$state)
        console.log(`  • ${id}: [${stateKeys.join(", ")}]`)
      }
    })

    return ids
  }

  window.__trackActions = (storeId = null) => {
    appStore.trackActions(storeId)
    if (storeId) {
      console.log(`Tracking enabled for store: ${storeId}`)
    } else {
      console.log(`Tracking enabled for all stores`)
    }
  }

  window.__getHistory = (filters = {}) => {
    const history = appStore.getHistory(filters)
    console.table(
      history.map((entry) => ({
        Store: entry.storeId,
        Action: entry.action,
        Params: JSON.stringify(entry.params),
        Time: entry.timestamp,
      })),
    )
    return history
  }

  window.__clearHistory = () => {
    appStore.clearHistory()
    console.log("History cleared")
  }

  window.__watchStore = (storeId, actionName = null) => {
    const filter = { storeId }
    if (actionName) filter.action = actionName

    return appStore.getHistory(filter)
  }

  console.log(
    "[AppStore] Debug helpers available:",
    "\n  • __appStore - Access app store instance",
    "\n  • __saveAll() - Save all stores state",
    "\n  • __loadAll(snapshot) - Load stores state",
    "\n  • __listStores() - List all registered stores",
    "\n  • __trackActions(storeId?) - Enable action tracking",
    "\n  • __getHistory(filters?) - Get action history",
    "\n  • __clearHistory() - Clear action history",
    "\n  • __watchStore(storeId, action?) - Watch specific store",
  )
}

export default defineNuxtPlugin(async () => {
  const appStore = useAppStore()

  try {
    const initialized = await autoInitializeStores()
    console.log(`[AppStore] ${initialized.length} stores initialized`)
  } catch (error) {
    console.error("[AppStore] Error during initialization:", error)
  }

  exposeDebugHelpers(appStore)
})
