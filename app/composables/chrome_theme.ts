import type { ComputedRef } from "vue";
import { useTheme } from "vuetify";

const DEFAULT_CHROME_THEME = "dark";
const INHERIT_THEME = "inherit";

// Vuetify theme to apply on the floating chrome (GlassCard panels, loading screen...).
// Apps choose it with `ogwFront.chromeTheme` in their app.config.ts; "inherit" follows the app's
// Current global theme (teleported content needs an explicit theme name to get its CSS variables).
function useChromeTheme(): ComputedRef<string> {
  const appConfig = useAppConfig();
  const theme = useTheme();
  return computed(() => {
    const chromeTheme = appConfig.ogwFront?.chromeTheme ?? DEFAULT_CHROME_THEME;
    return chromeTheme === INHERIT_THEME ? theme.global.name.value : chromeTheme;
  });
}

export { useChromeTheme };
