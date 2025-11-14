const autoStoreRegister = ({ store }) => {
  if (store.$id === "app") {
    return
  }

  const appStore = useAppStore()
  appStore.registerStore(store)
  console.log(`[AutoRegister] Store "${store.$id}" processed`)
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.$pinia.use(autoStoreRegister)
  console.log(
    "[AUTOREGISTER PLUGIN] Loaded automatically from OpenGeodeWeb-Front",
  )
  if (typeof window !== "undefined") {
    const origFetch = window.fetch
    window.fetch = async (input, init) => {
      const url = typeof input === "string" ? input : (input && input.url) || ""
      if (url.includes("/opengeodeweb_back/export_project")) {
        const body = init && init.body
        let snapshotKeys = []
        let filename = undefined
        try {
          filename = body && body.filename
          if (body && typeof body === "object" && body.snapshot) {
            snapshotKeys = Object.keys(body.snapshot || {})
          }
        } catch {}
        console.log("[net] fetch export_project", { url, filename, snapshotKeys })
        console.trace()
      }
      return origFetch(input, init)
    }
    const origOpen = XMLHttpRequest.prototype.open
    XMLHttpRequest.prototype.open = function (method, url, ...args) {
      if (typeof url === "string" && url.includes("/opengeodeweb_back/export_project")) {
        console.log("[net] xhr export_project", { method, url })
        console.trace()
      }
      return origOpen.call(this, method, url, ...args)
    }
  }
})
