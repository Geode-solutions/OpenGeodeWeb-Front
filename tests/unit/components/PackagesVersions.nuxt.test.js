import { describe, expect, test, vi } from "vitest"
import { mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime"
import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"

import PackagesVersions from "@ogw_front/components/PackagesVersions"
import { useGeodeStore } from "@ogw_front/stores/geode"
import { vuetify } from "../../utils"

describe("PackagesVersions", async () => {
  test(`Mount`, async () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
    })
    setActivePinia(pinia)
    const geodeStore = useGeodeStore()
    geodeStore.base_url = ""

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
