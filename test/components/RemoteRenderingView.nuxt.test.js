// @vitest-environment nuxt

import { describe, expect, test, vi } from "vitest"
import { mountSuspended } from "@nuxt/test-utils"
import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

// import RemoteRenderingView from "@/components/RemoteRenderingView.vue"
import { mountSuspended } from "@nuxt/test-utils/runtime"

const vuetify = createVuetify({
  components,
  directives,
})

describe("RemoteRenderingView.vue", async () => {
  test(`Test mount`, async () => {
    // const wrapper = mountSuspended(RemoteRenderingView, {
    //   global: {
    //     plugins: [vuetify],
    //   },
    // })
  })
})
