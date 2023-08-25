import { defineStore } from 'pinia'
import { use_errors_store } from './errors'
import { use_websocket_store } from './websocket'

export const use_cloud_store = defineStore('cloud', {
  state: () => ({
    ID: '',
    is_captcha_validated: false,
    is_cloud_running: false,
    is_connexion_launched: false,
    request_counter: 0
  }),
  getters: {
    geode_url: (state) => {
      const public_runtime_config = useRuntimeConfig().public
      var geode_url = `${public_runtime_config.GEODE_PROTOCOL}://${public_runtime_config.API_URL}:${public_runtime_config.GEODE_PORT}`
      if (process.env.NODE_ENV == 'production') {
        geode_url = geode_url + `/${state.ID}/geode`
      }
      console.log("geode_url",geode_url)
      return geode_url
    },
    viewer_url: (state) => {
      const public_runtime_config = useRuntimeConfig().public
      var viewer_url = `${public_runtime_config.VIEWER_PROTOCOL}://${public_runtime_config.API_URL}:${public_runtime_config.VIEWER_PORT}`
      if (process.env.NODE_ENV == 'production') {
        viewer_url = viewer_url + `/${state.ID}/viewer`
      }
      viewer_url = viewer_url + '/ws'
      return viewer_url
    },
  },
  actions: {
    async create_connexion () {
      const websocket_store = use_websocket_store()
      if (this.is_connexion_launched) { return }
      this.is_connexion_launched = true
      const ID = localStorage.getItem('ID')
      if (ID === null || typeof ID === 'undefined') {
        return this.create_backend()
      } else {
        const { data, error } = await useFetch(`${this.geode_url}/ping`, { method: 'POST' })
        console.log("error", error)
        if (data.value !== null) {
          this.ID = ID
          this.is_cloud_running = true
          websocket_store.ws_connect()
          return this.ping_task()
        } else {
          return this.create_backend()
        }
      }
    },
    async create_backend () {
      const websocket_store = use_websocket_store()
      const errors_store = use_errors_store()
      const config = useRuntimeConfig()
      const public_runtime_config = config.public
      const { data, error } = await useFetch(`${public_runtime_config.GEODE_PROTOCOL}://${public_runtime_config.API_URL}:${public_runtime_config.GEODE_PORT}${public_runtime_config.SITE_BRANCH}/tools/createbackend`, { method: 'POST' })
      if (data.value !== null) {
        this.ID = data.value.ID
        localStorage.setItem('ID', data.value.ID)
        this.is_cloud_running = true
        websocket_store.ws_connect()
        return this.ping_task()
      } else {
        console.log("error : ", error)
        errors_store.server_error = true
      }
    },

    ping_task () {
      setInterval(() => this.do_ping(), 10 * 1000)
    },
    async do_ping () {
      const errors_store = use_errors_store()
      const { data, error } = await useFetch(`${this.geode_url}/ping`, { method: 'POST' })
      if (data.value !== null) {
        this.is_cloud_running = true
      } else {
        errors_store.server_error = true
        console.log("error : ", error)
      }
    },

    mutations: {
      start_request (state) {
        state.request_counter++
      },
      stop_request (state) {
        state.request_counter--
      }
    }
  }
})
