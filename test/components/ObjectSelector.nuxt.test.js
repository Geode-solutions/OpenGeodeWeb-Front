// @vitest-environment nuxt

import { describe, expect, test } from "vitest"
import { mount } from "@vue/test-utils"
import vuetify from "vite-plugin-vuetify"
import { registerEndpoint } from "@nuxt/test-utils/runtime"

import ObjectSelector from "@/components/ObjectSelector.vue"
import FetchingData from "@/components/FetchingData.vue"

import schema from "@/assets/schemas/ObjectSelector.json"

describe("ObjectSelector.vue", async () => {
  test("Renders properly", async () => {
    const wrapper = mount(ObjectSelector, {
      global: {
        plugins: [vuetify],
      },
      props: { filenames: ["test.toto"], key: "test" },
    })
    wrapper.findComponent(FetchingData)
    expect(wrapper.find("v-card").exists()).toBe(true)
  })

  test("Select geode_object", async () => {
    registerEndpoint(schema.$id, {
      method: schema.method,
      handler: () => ({
        allowed_objects: {
          BRep: { is_loadable: true },
          StructuralModel: { is_loadable: true },
        },
      }),
    })
    const wrapper = mount(ObjectSelector, {
      global: {
        plugins: [vuetify()],
      },
      props: { filenames: ["test.toto"], key: "test" },
    })
    await wrapper.find("v-card").trigger("click")
    // expect(wrapper.emitted().update_values).toEqual({
    //   input_geode_object: "BRep",
    // })
  })
})
