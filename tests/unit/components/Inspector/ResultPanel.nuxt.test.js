// Third party imports
import { describe, expect, test } from "vitest"
import { mountSuspended } from "@nuxt/test-utils/runtime"

// Local imports
import InspectorResultPanel from "@ogw_front/components/Inspector/ResultPanel"
import { vuetify } from "../../../utils"

describe("Inspector/ResultPanel", async () => {
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

    expect(wrapper.exists()).toBeTruthy()
    expect(wrapper.componentVM.inspection_result).toStrictEqual(
      inspection_result,
    )

    const child_result_panel_wrapper =
      await wrapper.findComponent(InspectorResultPanel)
    expect(child_result_panel_wrapper.exists()).toBeTruthy()
    expect(
      child_result_panel_wrapper.componentVM.inspection_result,
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

    expect(wrapper.exists()).toBeTruthy()

    console.log({ wrapper })

    expect(wrapper.componentVM.inspection_result).toStrictEqual(
      inspection_result,
    )
  })
})
