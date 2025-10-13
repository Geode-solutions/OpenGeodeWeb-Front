import { useAppStore } from "@/stores/app_store.js"

// Export global helpers to window
export default defineNuxtPlugin(() => {
  const app = useAppStore()

  // Publish global helpers to window
  window.__appStore = app
  window.__saveAll = () => {
    const snapshot = app.saveAll()
    console.log("[AppStore] snapshot object:", snapshot)
    return snapshot
  }
  window.__loadAll = (snapshot) => {
    app.loadAll(snapshot)
    console.log("[AppStore] snapshot loadeed.")
  }
  //   window.__safeSaveAll = () => {
  //     const json = JSON.stringify(app.saveAll(), null, 2)
  //     console.log("[AppStore] snapshot JSON:", json)
  //     return json
  //   }

  console.log(
    "[AppStore] debug helpers ready: __appStore, __saveAll, __loadAll, __safeSaveAll",
  )
})
