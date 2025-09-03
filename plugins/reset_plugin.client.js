export function ResetPlugin({ store, pinia }) {
  const initialState = JSON.parse(JSON.stringify(store.$state))
  store.$reset = () => {
    store.$patch(JSON.parse(JSON.stringify(initialState)))
  }
}

export default defineNuxtPlugin(async (nuxtApp) => {
  nuxtApp.$pinia.use(ResetPlugin())
})

console.log("PINIA RESET PLUGIN")
