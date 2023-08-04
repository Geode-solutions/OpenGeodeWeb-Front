import { defineStore } from 'pinia'
import { use_errors_store } from './errors'

export const use_cloud_store = defineStore('cloud', {
  state: () => ({
    ID: '',
    is_captcha_validated: false,
    is_cloud_running: false,
    is_connexion_launched: false,
    request_counter: 0
  }),
  actions: {
    async create_connexion () {
      if (this.is_connexion_launched) { return }
      this.is_connexion_launched = true
      const ID = localStorage.getItem('ID')
      if (ID === null || typeof ID === 'undefined') {
        return this.create_backend()
      } else {
        const config = useRuntimeConfig()
        const { data, error } = await useFetch(`${config.public.API_URL}/${ID}/ping`, { method: 'POST' })
        console.log("error", error)
        if (data.value !== null) {
          this.ID = ID
          this.is_cloud_running = true
          return this.ping_task()
        } else {
          return this.create_backend()
        }
      }
    },
    async create_backend () {
      const errors_store = use_errors_store()
      const config = useRuntimeConfig()
      const { data, error } = await useFetch(`${config.public.API_URL}${config.public.SITE_BRANCH}/tools/createbackend`, { method: 'POST' })
      if (data.value !== null) {
        this.ID = data.value.ID
        localStorage.setItem('ID', data.value.ID)
        this.is_cloud_running = true
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
      const config = useRuntimeConfig()
      const { data, error } = await useFetch(`${config.public.API_URL}/${this.ID}/ping`, { method: 'POST' })
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
