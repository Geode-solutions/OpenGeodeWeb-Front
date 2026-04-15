// Node imports
import path from "node:path";

// Local imports
import package_json from "./package.json";

const __dirname = import.meta.dirname;
console.log(`Loading Nuxt config: ${import.meta.url}`);

const sharedAlias = {
  "@ogw_front": path.resolve(__dirname, "app"),
  "@ogw_internal": path.resolve(__dirname, "internal"),
  "@ogw_server": path.resolve(__dirname, "server"),
  "@ogw_tests": path.resolve(__dirname, "tests"),
};

export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      COMMAND_BACK: "opengeodeweb-back",
      COMMAND_VIEWER: "opengeodeweb-viewer",
      DATA_FOLDER_PATH: path.join("tests", "integration", "data", "uploads"),
      NUXT_ROOT_PATH: __dirname,
      MODE: process.env.MODE || "CLOUD",
      PROJECT: package_json.name,
    },
  },

  modules: [
    ["@pinia/nuxt", { autoImports: ["defineStore", "storeToRefs"] }],
    "@vueuse/nuxt",
    "vuetify-nuxt-module",
  ],
  imports: {
    scan: false,
  },

  ssr: false,

  alias: sharedAlias,

  // ** Global CSS
  css: ["vuetify/lib/styles/main.sass"],

  // ** Build configuration
  build: {
    transpile: ["vuetify"],
  },

  nitro: {
    scanDirs: [path.resolve(__dirname, "server")], // ← explicitly point to /repo/server
  },

  serverDir: path.resolve(__dirname, "server"),

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
    alias: sharedAlias,
    build: {
      sourcemap: process.env.NODE_ENV === "test", // Faster builds in test/CI
    },
    optimizeDeps: {
      include: [
        "ajv",
        "dexie",
        "fast-deep-equal",
        "globalthis",
        "h3",
        "get-port-please",
        "js-file-download",
        "lodash",
        "lodash/merge",
        "realistic-structured-clone",
        "seedrandom",
        "spark-md5",
        "util",
        "ws",
        "xmlbuilder2",
      ],
    },
    server: {
      fs: {
        allow: [
          path.resolve(__dirname, "../../node_modules/@fontsource"),
          path.resolve(__dirname, "../../node_modules/@mdi/font"),
        ],
      },
    },
  },
});
