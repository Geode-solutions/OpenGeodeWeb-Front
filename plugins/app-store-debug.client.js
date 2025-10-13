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
        console.log(`Initialized store: ${store.$id}`)
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
}

export default defineNuxtPlugin(async () => {
  const appStore = useAppStore()

  try {
    const initialized = await autoInitializeStores()
    console.log(`${initialized.length} stores auto-initialized`, initialized)
  } catch (error) {
    console.error("Error auto-initialization:", error)
  }

  exposeDebugHelpers(appStore)
})
