// Node imports
import path from "node:path";

// Local imports
import package_json from "./package.json";

const __dirname = import.meta.dirname;

export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      COMMAND_BACK: "opengeodeweb-back",
      COMMAND_VIEWER: "opengeodeweb-viewer",
      NUXT_ROOT_PATH: __dirname,
      MODE: process.env.MODE || "CLOUD",
      PROJECT: package_json.name,
    },
  },

  modules: [["@pinia/nuxt", { autoImports: ["defineStore", "storeToRefs"] }], "@vueuse/nuxt"],
  imports: {
    scan: false,
  },

  ssr: false,

  alias: {
    "@ogw_front": path.resolve(__dirname, "app"),
    "@ogw_internal": path.resolve(__dirname, "internal"),
    "@ogw_tests": path.resolve(__dirname, "tests"),
    "@ogw_shared": path.resolve(__dirname, "shared"),
    "@ogw_server": path.resolve(__dirname, "server"),
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
        "@kitware/vtk.js",
        "@kitware/vtk.js/Common/Core/Math",
        "@kitware/vtk.js/IO/Core/WSLinkClient",
        "@kitware/vtk.js/IO/XML/XMLPolyDataReader",
        "@kitware/vtk.js/Rendering/Core/Actor",
        "@kitware/vtk.js/Rendering/Core/AnnotatedCubeActor",
        "@kitware/vtk.js/Rendering/Core/ColorTransferFunction",
        "@kitware/vtk.js/Rendering/Core/Mapper",
        "@kitware/vtk.js/Rendering/Misc/GenericRenderWindow",
        "@kitware/vtk.js/Rendering/Misc/RemoteView",
        "@kitware/vtk.js/Rendering/OpenGL/Profiles/Geometry",
        "@kitware/vtk.js/Widgets/Core/WidgetManager",
        "@kitware/vtk.js/Widgets/Widgets3D/ImplicitPlaneWidget",
        "@vue/devtools-core",
        "@vue/devtools-kit",
        "ajv",
        "broadcast-channel",
        "dexie",
        "globalthis",
        "h3",
        "js-file-download",
        "lodash",
        "lodash/merge",
        "p-timeout",
        "seedrandom",
        "spark-md5",
        "uuid",
        "wslink",
        "wslink/src/SmartConnect",
        "xmlbuilder2",
      ],
    },
  },
});
