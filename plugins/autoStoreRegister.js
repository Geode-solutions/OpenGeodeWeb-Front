const autoRegister = ({ store }) => {
  if (!store || !store.$id) {
    console.warn("[AutoRegister] Invalid store object received", store)
    return
  }

  if (store.$id === "app") {
    return
  }

  const appStore = useAppStore()
  appStore.registerStore(store)
  console.log(`[AutoRegister] Store "${store.$id}" processed`)
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.$pinia.use(autoRegister)
  console.log("[AUTOREGISTER PLUGIN] Loaded automatically from OpenGeodeWeb-Front")
})
