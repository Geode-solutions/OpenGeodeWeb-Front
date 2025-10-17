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
  console.log("[AUTOREGISTER PLUGIN] Loaded automatically from OpenGeodeWeb-Front")
})
