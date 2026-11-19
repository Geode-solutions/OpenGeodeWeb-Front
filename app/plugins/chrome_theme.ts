import { CHROME_THEME_KEY, DEFAULT_CHROME_THEME } from "@ogw_front/composables/chrome_theme";

// Hands `ogwFront.chromeTheme` (app.config.ts) to the whole Vue app, see composables/chrome_theme.ts
export default defineNuxtPlugin({
  name: "ogw-chrome-theme",
  setup(nuxtApp) {
    const chromeTheme = useAppConfig().ogwFront?.chromeTheme ?? DEFAULT_CHROME_THEME;
    nuxtApp.vueApp.provide(CHROME_THEME_KEY, chromeTheme);
  },
});
