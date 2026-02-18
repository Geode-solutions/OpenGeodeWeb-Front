import { describe, expect, test, vi } from "vitest"

import Launcher from "@ogw_front/components/Launcher"
import ResizeObserver from "resize-observer-polyfill"
import { flushPromises } from "@vue/test-utils"
import { mountSuspended } from "@nuxt/test-utils/runtime"

import { useInfraStore } from "@ogw_front/stores/infra"
import { setupActivePinia, vuetify } from "../../utils"

// Mock navigator.locks API
const mockLockRequest = vi
  .fn()
  .mockImplementation(async (name, task) => await task({ name }))

vi.stubGlobal("navigator", {
  ...navigator,
  locks: {
    request: mockLockRequest,
  },
})

globalThis.ResizeObserver = ResizeObserver

describe(Launcher, async () => {
  test(`Mount`, async () => {
    const pinia = setupActivePinia()
    const infraStore = useInfraStore()
    const wrapper = await mountSuspended(Launcher, {
      global: {
        plugins: [vuetify, pinia],
      },
    })
    expect(wrapper.exists()).toBeTruthy()
    await infraStore.$patch({ is_captcha_validated: true })
    await flushPromises()
    expect(infraStore.create_backend).toHaveBeenCalled()
  })
})
