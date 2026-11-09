// Node imports
import path from "node:path";

// Minimal app that hosts the viewer of the OpenGeodeWeb-Front layer for the e2e tests: no navigation, no import UI.
// oxlint-disable-next-line import/no-default-export
export default defineNuxtConfig({
  extends: [path.resolve(import.meta.dirname, "..", "..", "..")],
  ssr: false,
  devtools: { enabled: false },
  app: {
    head: {
      titleTemplate: "OpenGeodeWeb e2e",
    },
  },
});
