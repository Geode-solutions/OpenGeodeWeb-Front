import type { ChromeTheme } from "@ogw_front/composables/chrome_theme";
import type { SceneColors } from "@ogw_front/utils/default_styles";

declare module "nuxt/schema" {
  interface AppConfigInput {
    ogwFront?: {
      chromeTheme?: ChromeTheme;
      orientationOverlay?: boolean;
      // Map or satellite view under the georeferenced data, see stores/basemap.ts
      basemap?: boolean;
      // Colors ({ red, green, blue, alpha }) of a new or reset scene, see plugins/scene_colors.ts
      sceneColors?: SceneColors;
    };
  }
}

// Apps extending this layer override these values in their own app.config.ts.
// oxlint-disable-next-line import/no-default-export
export default defineAppConfig({
  ogwFront: {
    // Vuetify theme forced on the floating chrome (GlassCard panels, loading screen...).
    // "inherit" makes it follow the app's current theme instead.
    chromeTheme: "dark",
    // Draw the orientation marker (axes or compass) as a front overlay instead of the viewer's VTK
    // Marker, which is then hidden (see composables/orientation_overlay.ts).
    orientationOverlay: false,
    // Offer the basemap (a map or satellite view under the data in the project CRS)
    basemap: false,
    // Colors of a new or reset scene, the OpenGeodeWeb ones when not set (see utils/default_styles)
    sceneColors: {},
  },
});
