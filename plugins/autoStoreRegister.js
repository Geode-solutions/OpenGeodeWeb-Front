import { useAppStore } from "../stores/app_store"

export const autoStoreRegister = ({ store }) => {
  if (!store || !store.$id) {
    console.warn("[AutoRegister] Invalid store object received", store)
    return
  }

  if (store.$id === "app") {
    return
  }

  const appStore = useAppStore()

  const isAlreadyRegistered = appStore.stores.some(
    (registeredStore) => registeredStore.$id === store.$id,
  )

  if (!isAlreadyRegistered) {
    appStore.registerStore(store)
    console.log(`[AutoRegister] Store "${store.$id}" registered`)
  } else {
    console.log(
      `[AutoRegister] Store "${store.$id}" already registered, skipping`,
    )
  }
}

export default autoStoreRegister
