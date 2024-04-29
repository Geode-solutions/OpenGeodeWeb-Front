// @vitest-environment nuxt

import { describe, expect, test } from "vitest"
import { mount } from "@vue/test-utils"

import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

import InspectorResultPanel from "@/components/Inspector/ResultPanel.vue"

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
      props: { inpection_result },
    })

    const v_expansion_panels = wrapper.findComponent(
      components.VExpansionPanels,
    )
    console.log("v_expansion_panels", v_expansion_panels)
  })
})
