import { createVuetify } from "vuetify"

import "@mdi/font/css/materialdesignicons.css"
import "vuetify/styles"

export const vuetify = createVuetify({
  defaultAssets: false,
  icons: {
    defaultSet: "mdi",
  },
  ssr: true,
  defaults: {
    VBtn: {
      style: "text-transform: none;",
    },
    VCard: {
      elevation: 5,
      style: "border-radius: 15px;",
    },
    VExpansionPanel: {
      elevation: 5,
      style: "border-radius: 15px;",
    },
  },
})

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(vuetify)
})
