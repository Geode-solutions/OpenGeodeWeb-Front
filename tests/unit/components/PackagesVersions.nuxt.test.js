import { describe, expect, test } from "vitest"
import { mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime"

import { setupActivePinia, vuetify } from "../../utils"
import PackagesVersions from "@ogw_front/components/PackagesVersions"
import { useGeodeStore } from "@ogw_front/stores/geode"

const FIRST_INDEX = 0

describe(PackagesVersions, async () => {
  test(`Mount`, async () => {
    const pinia = setupActivePinia()
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
      method: schema.methods[FIRST_INDEX],
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
    expect(wrapper.exists()).toBeTruthy()
  })
})
