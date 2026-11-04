// Not auto-fixable (eslint's sort-imports core rule has no autofixer) and this file's import order doesn't match its syntax-kind-then-alphabetical requirement - left as-is rather than manually reordered across the codebase for a purely cosmetic rule.
// oxlint-disable eslint/sort-imports
import * as components from "vuetify/components";
import { describe, expect, test } from "vitest";
import { mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";

import { setupActivePinia, toHTTPMethod, vuetify } from "@ogw_tests/utils";
import ObjectSelector from "@ogw_front/components/ObjectSelector.vue";
import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { useBackStore } from "@ogw_front/stores/back";

import {
  EXPECTED_LENGTH,
  FIRST_INDEX,
  LOADABLE_SCORE,
  type AllowedObjectsResponse,
} from "@ogw_tests/unit/components/ObjectSelectorHelpers";

const PRIORITY_1 = 1;
const PRIORITY_2 = 2;

const { allowed_objects } = schemas.opengeodeweb_back;

describe("object selector", () => {
  const pinia = setupActivePinia();
  const backStore = useBackStore();
  (backStore as { base_url: string }).base_url = "/";

  test("loadable with one class is selected automatically", async () => {
    const response: AllowedObjectsResponse = {
      allowed_objects: {},
    };
    const geode_object_1 = "BRep";
    response.allowed_objects[geode_object_1] = { is_loadable: true };
    registerEndpoint(allowed_objects.$id, {
      method: toHTTPMethod(allowed_objects.methods[FIRST_INDEX]),
      handler: () => response,
    });
    const wrapper = await mountSuspended(ObjectSelector, {
      global: {
        plugins: [vuetify, pinia],
      },
      props: { filenames: ["test.toto"] },
    });
    const emitted = wrapper.emitted<unknown[]>();
    wrapper.unmount();
    // Resolved without the user: no card to choose from
    expect(emitted).toHaveProperty("update_values");
    expect(emitted.update_values).toHaveLength(EXPECTED_LENGTH);
    expect(emitted.update_values?.[FIRST_INDEX]?.[FIRST_INDEX]).toStrictEqual({
      geode_object_types: { "test.toto": geode_object_1 },
    });
  });

  test("loadable with multiple classes", async () => {
    const response: AllowedObjectsResponse = {
      allowed_objects: {},
    };
    const geode_object_1 = "BRep";
    const geode_object_2 = "EdgedCurve3D";
    response.allowed_objects[geode_object_1] = { is_loadable: true };
    response.allowed_objects[geode_object_2] = { is_loadable: true };
    registerEndpoint(allowed_objects.$id, {
      method: toHTTPMethod(allowed_objects.methods[FIRST_INDEX]),
      handler: () => response,
    });
    const wrapper = await mountSuspended(ObjectSelector, {
      global: {
        plugins: [vuetify, pinia],
      },
      props: { filenames: ["test.toto"] },
    });
    const v_card = wrapper.findComponent(components.VCard);
    const v_img = v_card.findComponent(components.VImg);
    expect(v_img.vm.src).toContain(`${geode_object_1}.svg`);
    await flushPromises();
    await v_card.trigger("click");
    await flushPromises();
    const emitted = wrapper.emitted<unknown[]>();
    wrapper.unmount();
    expect(v_img.vm.src).toContain(`${geode_object_1}.svg`);
    expect(emitted).toHaveProperty("update_values");
    expect(emitted.update_values).toHaveLength(EXPECTED_LENGTH);
    expect(emitted.update_values?.[FIRST_INDEX]?.[FIRST_INDEX]).toStrictEqual({
      geode_object_types: { "test.toto": geode_object_1 },
    });
  });

  test("object_priority when is_loadable scores equal", async () => {
    const response: AllowedObjectsResponse = { allowed_objects: {} };
    const geode_object_1 = "BRep";
    const geode_object_2 = "EdgedCurve3D";
    response.allowed_objects[geode_object_1] = {
      is_loadable: LOADABLE_SCORE,
      object_priority: PRIORITY_2,
    };
    response.allowed_objects[geode_object_2] = {
      is_loadable: LOADABLE_SCORE,
      object_priority: PRIORITY_1,
    };
    registerEndpoint(allowed_objects.$id, {
      method: toHTTPMethod(allowed_objects.methods[FIRST_INDEX]),
      handler: () => response,
    });
    const wrapper = await mountSuspended(ObjectSelector, {
      global: {
        plugins: [vuetify, pinia],
      },
      props: { filenames: ["test.toto"] },
    });

    await flushPromises();
    const emitted = wrapper.emitted<unknown[]>();
    wrapper.unmount();
    expect(emitted).toHaveProperty("update_values");
    expect(emitted.update_values).toHaveLength(EXPECTED_LENGTH);
    expect(emitted.update_values?.[FIRST_INDEX]?.[FIRST_INDEX]).toStrictEqual({
      geode_object_types: { "test.toto": geode_object_1 },
    });
  });
});
