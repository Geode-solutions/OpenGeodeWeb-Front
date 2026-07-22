// Node imports
import path from "node:path";

// Local imports
import package_json from "./package.json";
import { getBackPort, getViewerPort } from "./server/utils/microservice-registry.js";

const __dirname = import.meta.dirname;

export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      COMMAND_BACK: "opengeodeweb-back",
      COMMAND_VIEWER: "opengeodeweb-viewer",
      BACK_BASE_URL: undefined,
      VIEWER_BASE_URL: undefined,
      NUXT_ROOT_PATH: __dirname,
      MODE: process.env.MODE || "CLOUD",
      PROJECT: package_json.name,
    },
  },

  modules: [["@pinia/nuxt", { autoImports: ["defineStore", "storeToRefs"] }], "@vueuse/nuxt"],
  // imports: {
  //   scan: false,
  // },

  alias: {
    "@ogw_front": path.resolve(__dirname, "app"),
    "@ogw_internal": path.resolve(__dirname, "internal"),
    "@ogw_server": path.resolve(__dirname, "server"),
    "@ogw_tests": path.resolve(__dirname, "tests"),
  },

  // ** Global CSS
  css: ["vuetify/lib/styles/main.sass"],

  // ** Build configuration
  build: {
    transpile: ["vuetify"],
  },

  vuetify: {
    vuetifyOptions: {
      defaults: {
        VTooltip: {
          openDelay: 500,
        },
      },
    },
  },

  vue: {
    compilerOptions: {
      isCustomElement: (tag) => ["md-linedivider"].includes(tag),
    },
  },

  vite: {
    optimizeDeps: {
      include: [
        "ajv",
        "fast-deep-equal",
        "globalthis",
        "h3",
        "js-file-download",
        "lodash",
        "seedrandom",
      ],
    },
  },
});
