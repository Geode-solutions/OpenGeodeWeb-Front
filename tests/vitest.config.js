import { defineConfig } from "vitest/config"
import { defineVitestProject } from "@nuxt/test-utils/config"
import { playwright } from "@vitest/browser-playwright"
// import vue from "@vitejs/plugin-vue"

const globalRetry = process.env.CI ? 3 : 0

export default defineConfig({
  test: {
    projects: [
      await defineVitestProject({
        // plugins: [vue()],
        test: {
          name: "browser",
          include: ["tests/browser/**/*.test.js"],
          setupFiles: ["vitest-browser-vue"],
          browser: {
            enabled: true,
            // headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
          retry: globalRetry,
        },
      }),
      await defineVitestProject({
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.js"],
          environment: "nuxt",
          server: {
            deps: {
              inline: ["vuetify"],
            },
          },
          retry: globalRetry,
        },
      }),
      await defineVitestProject({
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.js"],
          environment: "nuxt",
          fileParallelism: false,
          server: {
            deps: {
              inline: ["vuetify"],
            },
          },
          retry: globalRetry,
        },
      }),
    ],
  },
})
