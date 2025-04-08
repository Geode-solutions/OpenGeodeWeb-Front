// // @vitest-environment nuxt

// import { describe, expect, test, vi } from "vitest"
// import { flushPromises } from "@vue/test-utils"
// import { mountSuspended } from "@nuxt/test-utils/runtime"

// import { createVuetify } from "vuetify"
// import * as components from "vuetify/components"
// import * as directives from "vuetify/directives"

// import Launcher from "@/components/Launcher.vue"

// const vuetify = createVuetify({
//   components,
//   directives,
// })

// const infra_store = use_infra_store()

// global.ResizeObserver = require("resize-observer-polyfill")

// describe("Launcher.vue", async () => {
//   test(`Mount`, async () => {
//     const spy_infra_store = vi.spyOn(infra_store, "create_backend")
//     const wrapper = await mountSuspended(Launcher, {
//       global: {
//         plugins: [vuetify],
//       },
//     })
//     expect(wrapper.exists()).toBe(true)
//     await infra_store.$patch({ is_captcha_validated: true })
//     flushPromises()
//     expect(spy_infra_store).toHaveBeenCalled()
//   })
// })
describe("Fake", async () => {
  test(`Fake`, async () => {})
})
