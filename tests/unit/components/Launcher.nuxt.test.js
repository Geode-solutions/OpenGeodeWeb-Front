import { describe, expect, test, vi } from "vitest"
import { flushPromises } from "@vue/test-utils"
import { mountSuspended } from "@nuxt/test-utils/runtime"
import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"

import Launcher from "@ogw_front/components/Launcher"

import { useInfraStore } from "@ogw_front/stores/infra"
import { vuetify } from "../../utils"

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

describe("Launcher", async () => {
  test(`Mount`, async () => {
    const pinia = createTestingPinia({
      stubActions: false,
      createSpy: vi.fn,
    })
    setActivePinia(pinia)
    const infraStore = useInfraStore()
    const wrapper = await mountSuspended(Launcher, {
      global: {
        plugins: [pinia, vuetify],
      },
    })
    expect(wrapper.exists()).toBe(true)
    await infraStore.$patch({ is_captcha_validated: true })
    await flushPromises()
    expect(infraStore.create_backend).toHaveBeenCalled()
  })
})
