import { describe, expect, test, vi } from "vitest"
import { flushPromises } from "@vue/test-utils"
import { mountSuspended } from "@nuxt/test-utils/runtime"

import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"

import Launcher from "~/components/Launcher.vue"

const vuetify = createVuetify({
  components,
  directives,
})

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
    const pinia = createTestingPinia({
      stubActions: false,
      createSpy: vi.fn,
    })
    setActivePinia(pinia)
    const infra_store = useInfraStore()
    const wrapper = await mountSuspended(Launcher, {
      global: {
        plugins: [pinia, vuetify],
      },
    })
    expect(wrapper.exists()).toBe(true)
    await infra_store.$patch({ is_captcha_validated: true })
    await flushPromises()
    expect(infra_store.create_backend).toHaveBeenCalled()
  })
})
