// Node imports
import fs from "node:fs";
import path from "node:path";

// Third party imports
import { defineNuxtConfig } from "nuxt/config";

// Local imports
import package_json from "./package.json";

const __dirname = import.meta.dirname;

// Oxlint's type-aware linter auto-discovers each file's nearest tsconfig.json
// By walking up directories, and any "extends" on that discovered file makes
// Its whole type-aware resolution collapse: every symbol coming through the
// Aliases normally only defined in .nuxt/tsconfig.json (@ogw_shared, etc.,
// But also Nuxt's own #app/#imports/defineStore auto-imports) becomes an
// `error` type, even though tsc/vue-tsc resolve the exact same "extends"
// Chain correctly (oxc-project/oxc#22345). The only fix is for the root
// Tsconfig.json to be fully self-contained: no "extends", with its own copy
// Of .nuxt/tsconfig.json's compilerOptions.paths (re-relativized here, since
// They're written relative to .nuxt/) and a deliberately project-wide
// "include" (unlike .nuxt/tsconfig.json's own include, which only covers
// Nuxt's conventional folders and would otherwise silently drop internal/,
// Tests/, etc. from the program). Regenerated on every Nuxt prepare so it
// Can never drift from what Nuxt actually resolves.
function remap_path_to_root(target: string, build_dir: string) {
  const relative = path
    .relative(__dirname, path.resolve(build_dir, target))
    .split(path.sep)
    .join("/");
  return relative.startsWith("./") || relative.startsWith("../") ? relative : `./${relative}`;
}

// Nuxt requires this file's config object as the default export; the shared org lint config's no-default-export override only lists *.config.js, not *.config.ts, since this file predates the TypeScript migration.
// oxlint-disable-next-line import/no-default-export
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

  modules: [
    "vuetify-nuxt-module",
    ["@pinia/nuxt", { autoImports: ["defineStore", "storeToRefs"] }],
    "@vueuse/nuxt",
  ],
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
  css: ["vuetify/lib/styles/main.sass", path.resolve(__dirname, "app/assets/css/main.css")],

  // ** Build configuration
  build: {
    transpile: ["vuetify"],
  },

  vuetify: {
    moduleOptions: {
      prefixComposables: true,
      enableRules: false,
      rulesConfiguration: {
        fromLabs: false,
      },
    },
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
      isCustomElement: (tag: string) => ["md-linedivider"].includes(tag),
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
  typescript: {
    tsConfig: {
      compilerOptions: {
        types: ["node", "ws", "busboy"],
      },
    },
  },

  hooks: {
    "prepare:types": ({ tsConfig }) => {
      const paths = tsConfig.compilerOptions?.paths;
      if (!paths) {
        return;
      }
      const build_dir = path.resolve(__dirname, ".nuxt");
      const root_paths = Object.fromEntries(
        Object.entries(paths).map(([alias, targets]) => [
          alias,
          targets.map((target) => remap_path_to_root(target, build_dir)),
        ]),
      );
      fs.writeFileSync(
        path.resolve(__dirname, "tsconfig.json"),
        `${JSON.stringify(
          {
            compilerOptions: { ...tsConfig.compilerOptions, paths: root_paths },
            include: ["**/*", "./.nuxt/nuxt.d.ts"],
          },
          null,
          2,
        )}\n`,
      );
    },
  },
});
