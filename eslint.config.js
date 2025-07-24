import vue from "eslint-plugin-vue"
import vuetify from "eslint-plugin-vuetify"
import nuxt from "eslint-plugin-nuxt"

export default [
  {
    files: ["**/*.{js,ts,vue}"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        // ajoute d'autres globals si nécessaire
      },
    },
    plugins: {
      vue,
      vuetify,
      nuxt,
    },
    rules: {
      ...vue.configs.recommended.rules,
      ...vuetify.configs.recommended.rules,
      ...nuxt.configs.recommended.rules,
    },
  },
]
