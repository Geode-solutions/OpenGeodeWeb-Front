// @vitest-environment nuxt

import { describe, expect, test } from "vitest"
import { mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime"

import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"

import PackagesVersions from "@/components/PackagesVersions.vue"

const vuetify = createVuetify({
  components,
  directives,
})

describe("PackagesVersions.vue", async () => {
  test(`Mount`, async () => {
    const pinia = createTestingPinia()
    setActivePinia(pinia)
    const geode_store = use_geode_store()
    geode_store.base_url = ""

    const schema = {
      $id: "/versions",
      methods: ["GET"],
      type: "object",
      properties: {},
      additionalProperties: false,
    }
    registerEndpoint(schema.$id, {
      method: schema.methods[0],
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
        plugins: [vuetify, pinia],
      },
      props: { schema },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
