const autoStoreRegister = ({ store }) => {
  if (store.$id === "app") {
    return
  }

  const appStore = useAppStore()
  appStore.registerStore(store)
  console.log(`[AutoRegister] Store "${store.$id}" processed`)
}

export default defineNuxtPlugin({
  name: "auto-store-register",
  dependsOn: ["pinia"],
  setup(nuxtApp) {
    if (nuxtApp.$pinia) {
      nuxtApp.$pinia.use(autoStoreRegister)
      console.log(
        "[AUTOREGISTER PLUGIN] Loaded automatically from OpenGeodeWeb-Front",
      )
    } else {
      console.error(
        "[AUTOREGISTER PLUGIN] $pinia is not defined! Plugin execution skipped.",
      )
    }
  },
})
