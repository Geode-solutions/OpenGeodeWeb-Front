// Third party imports
import * as components from "vuetify/components";
import { describe, expect, test, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";

// Local imports
import { setupActivePinia, vuetify } from "@ogw_tests/utils";
import InspectorInspectionButton from "@ogw_front/components/Inspector/InspectionButton";
import { useGeodeStore } from "@ogw_front/stores/geode";

describe("inspector inspection button", () => {
  const pinia = setupActivePinia();
  const geodeStore = useGeodeStore();
  geodeStore.base_url = "";

  test("with issues", async () => {
    const inspection_result = {
      title: "Brep inspection",
      nb_issues: 3,
      children: [
        {
          title: "Brep inspection",
          nb_issues: 2,
          issues: ["issue 1", "issue 2"],
        },
        {
          title: "Brep inspection",
          nb_issues: 1,
          issues: ["issue 1"],
        },
      ],
    };
    geodeStore.request = vi.fn((_schema, _params, callbacks) => {
      callbacks?.response_function?.({ inspection_result });
      return Promise.resolve({ inspection_result });
    });
    const geode_object_type = "BRep";
    const filename = "test.txt";
    const wrapper = await mountSuspended(InspectorInspectionButton, {
      global: {
        plugins: [vuetify, pinia],
      },
      props: { geode_object_type, filename },
    });
    expect(wrapper.exists()).toBe(true);
    const v_btn = await wrapper.findComponent(components.VBtn);
    await v_btn.trigger("click");
    await flushPromises();

    expect(wrapper.emitted()).toHaveProperty("update_values");
    expect(wrapper.emitted().update_values).toHaveLength(1);
    expect(wrapper.emitted().update_values[0][0]).toStrictEqual({
      inspection_result: [inspection_result],
    });
    expect(wrapper.emitted()).toHaveProperty("increment_step");
  });
});
