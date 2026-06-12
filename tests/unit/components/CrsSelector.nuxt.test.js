// Third party imports
import { beforeEach, describe, expect, test, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";

// Local imports
import { setupActivePinia, vuetify } from "@ogw_tests/utils";
import CrsSelector from "@ogw_front/components/CrsSelector";
import { useBackStore } from "@ogw_front/stores/back";

const EXPECTED_LENGTH = 1;
const FIRST_INDEX = 0;

let pinia = undefined;
let backStore = undefined;

describe("crs selector", () => {
  beforeEach(() => {
    pinia = setupActivePinia();
    backStore = useBackStore();
    backStore.base_url = "/";
  });

  test("default behavior", async () => {
    const crs_list = [
      {
        authority: "EPSG",
        code: "2000",
        name: "Anguilla 1957 / British West Indies Grid",
      },
    ];

    // Mock backStore.request instead of registerEndpoint
    backStore.request = vi.fn((request, callbacks) => {
      callbacks.response_function({ crs_list });
      return Promise.resolve({ crs_list });
    });

    const key_to_update = "key";
    const wrapper = await mountSuspended(CrsSelector, {
      global: {
        plugins: [vuetify, pinia],
      },
      props: { geodeObjectType: "BRep", keyToUpdate: key_to_update },
    });
    const td_wrapper = await wrapper.find("td");
    await wrapper.vm.$nextTick();
    const input = await td_wrapper.find("input");
    await input.trigger("click");
    expect(wrapper.emitted()).toHaveProperty("update_values");
    expect(wrapper.emitted().update_values).toHaveLength(EXPECTED_LENGTH);
    expect(wrapper.emitted().update_values[FIRST_INDEX][FIRST_INDEX]).toStrictEqual({
      [key_to_update]: crs_list[FIRST_INDEX],
    });
  });
});
