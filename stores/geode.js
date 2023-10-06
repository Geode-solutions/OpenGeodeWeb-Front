export const use_geode_store = defineStore('geode', {
  state: () => ({
    request_counter: 0,
    is_running: false,
  }),
  getters: {
    base_url: () => {
      const cloud_store = use_cloud_store()
      const public_runtime_config = useRuntimeConfig().public
      var geode_url = `${public_runtime_config.GEODE_PROTOCOL}://${public_runtime_config.API_URL}:${public_runtime_config.GEODE_PORT}`
      console.log('ID', cloud_store.ID)
      if (process.env.NODE_ENV == 'production') {
        geode_url += `/${cloud_store.ID}/geode`
      }
      return geode_url
    },
    is_busy: (state) => {
      return state.request_counter > 0
    },
  },
  actions: {
    ping_task() {
      setInterval(() => this.do_ping(), 10 * 1000)
    },
    async do_ping() {
      const errors_store = use_errors_store()
      const { data, error } = await useFetch(`${this.base_url}/ping`, {
        method: 'POST',
      })
      if (data.value !== null) {
        this.is_running = true
      } else {
        errors_store.server_error = true
        console.log('error : ', error)
      }
    },
    start_request() {
      this.request_counter++
    },
    stop_request() {
      this.request_counter--
    },
  },
})
