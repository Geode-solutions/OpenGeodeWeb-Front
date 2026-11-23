import { phosphorIconOptions } from "@ogw_front/utils/phosphor_icons";

// Vuetify-nuxt-module only takes serializable icon options in nuxt.config (where its own icon sets
// Are disabled), so the component based Phosphor set is registered here, before Vuetify is created
export default defineNuxtPlugin({
  name: "ogw-phosphor-icons",
  enforce: "pre",
  setup(nuxtApp) {
    nuxtApp.hook("vuetify:before-create", ({ vuetifyOptions }) => {
      vuetifyOptions.icons = phosphorIconOptions();
    });
  },
});
