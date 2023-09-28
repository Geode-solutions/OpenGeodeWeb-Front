import { defineStore } from 'pinia'

export const use_geode_store = defineStore('geode', {
  state: () => ({
    request_counter: 0
  }),
  getters: {
    api_busy: (state) => {
      return state.request_counter > 0
    }
  },
  actions: {
    start_request (state) {
      state.request_counter++
    },
    stop_request (state) {
      state.request_counter--
    }
  }
})
