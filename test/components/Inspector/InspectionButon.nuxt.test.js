// @vitest-environment nuxt

import { describe, expect, test } from "vitest"
import { registerEndpoint, mountSuspended } from "@nuxt/test-utils/runtime"

import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

import InspectorResultPanel from "@/components/Inspector/ResultPanel.vue"
import schemas from "@geode/opengeodeweb-back/schemas.json"

const inspect_file_schema = schemas.opengeodeweb_back.inspect_file

const vuetify = createVuetify({
  components,
  directives,
})

const inpection_result = [
  {
    title: "Brep inspection",
    nb_issues: 27,
    children: [
      {
        title: "Model topology inspection",
        nb_issues: 25,
        children: [
          { title: "test topology 1", nb_issues: 25 },
          { title: "test topology 2", nb_issues: 0 },
        ],
      },
      {
        title: "Meshes inspection",
        nb_issues: 2,
        children: [
          { title: "test meshes 1", nb_issues: 1 },
          { title: "test meshes 2", nb_issues: 1 },
        ],
      },
    ],
  },
]

describe("Inspector/ResultPanel.vue", async () => {
  test(`Test render`, async () => {
    const wrapper = mount(InspectorResultPanel, {
      global: {
        plugins: [vuetify],
      },
      props: { inspection_results: [], fetch_results: true },
    })
    const td = await wrapper.find("td")
    await wrapper.vm.$nextTick()
    const input = await td.find("input")
    await input.trigger("click")
    expect(wrapper.emitted()).toHaveProperty("update_values")
    expect(wrapper.emitted().update_values).toHaveLength(1)
    expect(wrapper.emitted().update_values[0][0]).toEqual({
      [inspection_results]: crs_list[0],
    })
  })
})
