// Only ever fires now that tests are .ts; asks every bare `vi.fn()` mock to carry an explicit call-signature type parameter. Real value for a handful of mocks, but for the many plain mock objects across this test suite it would mean guessing a signature that's already implied by how the mock is used (risking a type that quietly doesn't match, which defeats the point) rather than deriving it from each real function - left off rather than doing that at scale.
// oxlint-disable vitest/require-mock-type-parameters
// Third party imports
import { beforeEach, describe, expect, test, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";

// Local imports
import { setupActivePinia, vuetify } from "@ogw_tests/utils";
import CrsSelector from "@ogw_front/components/CrsSelector.vue";
import { useBackStore } from "@ogw_front/stores/back";

const EXPECTED_LENGTH = 1;
const FIRST_INDEX = 0;

// These are assigned in beforeEach (a real defined value by the time any test runs) rather than at declaration, so a `| undefined` type would just force needless narrowing at every call site below.
// oxlint-disable-next-line eslint/init-declarations
let pinia: ReturnType<typeof setupActivePinia>;
// oxlint-disable-next-line eslint/init-declarations
let backStore: ReturnType<typeof useBackStore>;

describe("crs selector", () => {
  beforeEach(() => {
    pinia = setupActivePinia();
    backStore = useBackStore();
    (backStore as { base_url: string }).base_url = "/";
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
    backStore.request = vi.fn(
      (_request: unknown, callbacks: { response_function?: (response: unknown) => void }) => {
        callbacks.response_function?.({ crs_list });
        return Promise.resolve({ crs_list });
      },
    );

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
    expect(wrapper.emitted<unknown[]>().update_values).toHaveLength(EXPECTED_LENGTH);
    expect(wrapper.emitted<unknown[]>().update_values?.[FIRST_INDEX]?.[FIRST_INDEX]).toStrictEqual({
      [key_to_update]: crs_list[FIRST_INDEX],
    });
  });
});
