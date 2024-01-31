// @vitest-environment nuxt

import { describe, expect, test } from "vitest"
import { mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime"

import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

import PackagesVersions from "@/components/PackagesVersions.vue"

const vuetify = createVuetify({
  components,
  directives,
})

global.ResizeObserver = require("resize-observer-polyfill")

describe("PackagesVersions.vue", async () => {
  test(`Mount`, async () => {
    const schema = {
      $id: "/versions",
      method: "GET",
      type: "object",
      properties: {},
      additionalProperties: false,
    }
    registerEndpoint(schema.$id, {
      method: schema.method,
      handler: () => ({
        versions: [
          {
            package: "package",
            version: "version",
          },
        ],
      }),
    })
    const wrapper = await mountSuspended(PackagesVersions, {
      global: {
        plugins: [vuetify],
      },
      props: { schema },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
