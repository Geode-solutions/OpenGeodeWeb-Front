import { type ComputedRef, computed, inject } from "vue";
import { useTheme } from "vuetify";

const DEFAULT_CHROME_THEME = "dark";
const INHERIT_THEME = "inherit";
// Provided on the Vue app by plugins/chrome_theme.ts. A plain string key and Vue's inject (no Nuxt
// Composable) so components bundled outside Nuxt, such as Vease extensions, read it from the host app.
const CHROME_THEME_KEY = "ogw:chrome-theme";

// Vuetify theme to apply on the floating chrome (GlassCard panels, loading screen...).
// Apps choose it with `ogwFront.chromeTheme` in their app.config.ts; "inherit" follows the app's
// Current global theme (teleported content needs an explicit theme name to get its CSS variables).
function useChromeTheme(): ComputedRef<string> {
  const chromeTheme = inject<string>(CHROME_THEME_KEY, DEFAULT_CHROME_THEME);
  const theme = useTheme();
  return computed(() => (chromeTheme === INHERIT_THEME ? theme.global.name.value : chromeTheme));
}

export { CHROME_THEME_KEY, DEFAULT_CHROME_THEME, useChromeTheme };
