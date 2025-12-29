import { getActivePinia } from "pinia"
import { useAppStore } from "../stores/app.js"

const autoStoreRegister = ({ store }) => {
  if (store.$id === "app") {
    return
  }

  const appStore = useAppStore()
  appStore.registerStore(store)
  console.log(`[AutoRegister] Store "${store.$id}" processed`)
}

export default defineNuxtPlugin((nuxtApp) => {
  const pinia = nuxtApp.$pinia || getActivePinia()
  if (pinia) {
    pinia.use(autoStoreRegister)
    console.log(
      "[AUTOREGISTER PLUGIN] Loaded automatically from OpenGeodeWeb-Front",
    )
  } else {
    console.warn(
      "[AUTOREGISTER PLUGIN] Pinia instance not found, skipping registration",
    )
  }
})
