export default defineNuxtConfig({
  imports: {
    dirs: ['stores'],
  },

  modules: [['@pinia/nuxt', { autoImports: ['defineStore'] }]],
})
