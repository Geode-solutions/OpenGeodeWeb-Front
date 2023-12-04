import { createVuetify } from "vuetify"

import "@mdi/font/css/materialdesignicons.css"
import colors from "vuetify/lib/util/colors"
import "vuetify/styles"

const light_theme = {
  dark: false,
  colors: {
    background: "#FFFFFF",
    primary: colors.teal.darken1,
    secondary: colors.teal.lighten4,
    accent: colors.amber.accent4,
    error: colors.red.lighten2,
    info: colors.yellow.accent4,
    success: colors.green.accent4,
    warning: colors.orange.accent4,
  },
}

export const vuetify = createVuetify({
  theme: {
    defaultTheme: "light_theme",
    themes: {
      light_theme,
    },
  },
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
