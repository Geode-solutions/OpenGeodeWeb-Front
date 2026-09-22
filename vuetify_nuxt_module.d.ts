// Vuetify-nuxt-module@1.0.0-rc.5 reads its options from the top-level `vuetify`
// Key in nuxt.config.ts (see its `layer.config.vuetify?.moduleOptions` lookup),
// But its own type declarations only augment `NuxtHooks`, not `NuxtConfig` -
// This restores that missing augmentation.
import type { ModuleOptions } from "vuetify-nuxt-module";

declare module "@nuxt/schema" {
  interface NuxtConfig {
    vuetify?: ModuleOptions;
  }
}
