import { describe, expect, test, vi } from "vitest"
import { flushPromises } from "@vue/test-utils"
import { mountSuspended } from "@nuxt/test-utils/runtime"

import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

import Launcher from "@ogw_f/components/Launcher.vue"

const vuetify = createVuetify({
  components,
  directives,
})

const infra_store = useInfraStore()

// Mock navigator.locks API
const mockLockRequest = vi.fn().mockImplementation(async (name, callback) => {
  return callback({ name })
})

vi.stubGlobal("navigator", {
  ...navigator,
  locks: {
    request: mockLockRequest,
  },
})

global.ResizeObserver = require("resize-observer-polyfill")

describe("Launcher.vue", async () => {
  test(`Mount`, async () => {
    const spy_create_backend = vi.spyOn(infra_store, "create_backend")
    const wrapper = await mountSuspended(Launcher, {
      global: {
        plugins: [vuetify],
      },
    })
    expect(wrapper.exists()).toBe(true)
    await infra_store.$patch({ is_captcha_validated: true })
    flushPromises()
    expect(spy_create_backend).toHaveBeenCalled()
  })
})
