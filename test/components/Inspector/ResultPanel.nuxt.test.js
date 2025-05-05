import { describe, expect, test } from "vitest"
import { mountSuspended } from "@nuxt/test-utils/runtime"

import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

import InspectorResultPanel from "@/components/Inspector/ResultPanel.vue"

const vuetify = createVuetify({
  components,
  directives,
})

describe("Inspector/ResultPanel.vue", async () => {
  test(`Test with issues`, async () => {
    const inspection_result = [
      {
        title: "Brep inspection",
        nb_issues: 26,
        children: [],
      },
    ]

    const wrapper = await mountSuspended(InspectorResultPanel, {
      global: {
        plugins: [vuetify],
      },
      props: { inspection_result },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.componentVM.opened_panels._value).toStrictEqual([0])
    expect(wrapper.componentVM.props.inspection_result).toStrictEqual(
      inspection_result,
    )

    const child_result_panel_wrapper =
      await wrapper.findComponent(InspectorResultPanel)
    expect(child_result_panel_wrapper.exists()).toBe(true)
    expect(
      child_result_panel_wrapper.componentVM.props.inspection_result,
    ).toStrictEqual(inspection_result[0].children)
  })

  test(`Test without issues`, async () => {
    const inspection_result = [
      {
        title: "Brep inspection",
        nb_issues: 0,
      },
    ]
    const wrapper = await mountSuspended(InspectorResultPanel, {
      global: {
        plugins: [vuetify],
      },
      props: { inspection_result },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.componentVM.opened_panels._value).toStrictEqual([])
    expect(wrapper.componentVM.props.inspection_result).toStrictEqual(
      inspection_result,
    )
  })
})
