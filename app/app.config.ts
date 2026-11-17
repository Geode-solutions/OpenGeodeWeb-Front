declare module "nuxt/schema" {
  interface AppConfigInput {
    ogwFront?: {
      chromeTheme?: string;
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
  },
});
