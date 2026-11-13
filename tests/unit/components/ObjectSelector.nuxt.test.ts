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

const SECOND_INDEX = 1;
const LESS_LOADABLE_SCORE = 0.5;

const { allowed_objects } = schemas.opengeodeweb_back;

describe("object selector", () => {
  const pinia = setupActivePinia();
  const backStore = useBackStore();
  (backStore as { base_url: string }).base_url = "/";

  test("loadable with one class is selected automatically", async () => {
    const geode_object_1 = "BRep";
    const response: AllowedObjectsResponse = {
      allowed_objects: {},
      objects_to_load: [geode_object_1],
    };
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
      geode_object_types: { "test.toto": [geode_object_1] },
    });
  });

  test("loadable with multiple classes", async () => {
    const response: AllowedObjectsResponse = {
      allowed_objects: {},
      objects_to_load: [],
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
      geode_object_types: { "test.toto": [geode_object_1] },
    });
  });

  test("every content of a mixed file is loaded without user input", async () => {
    const response: AllowedObjectsResponse = {
      allowed_objects: {
        TriangulatedSurface3D: { is_loadable: LOADABLE_SCORE, loadable_family: "SurfaceMesh" },
        PolygonalSurface3D: { is_loadable: LOADABLE_SCORE, loadable_family: "SurfaceMesh" },
        TetrahedralSolid3D: { is_loadable: LOADABLE_SCORE, loadable_family: "SolidMesh" },
      },
      objects_to_load: ["TriangulatedSurface3D", "TetrahedralSolid3D"],
    };
    registerEndpoint(allowed_objects.$id, {
      method: toHTTPMethod(allowed_objects.methods[FIRST_INDEX]),
      handler: () => response,
    });
    const wrapper = await mountSuspended(ObjectSelector, {
      global: { plugins: [vuetify, pinia] },
      props: { filenames: ["mesh.vtu"] },
    });
    await flushPromises();
    expect(wrapper.findComponent(components.VCard).exists()).toBe(false);
    expect(wrapper.find('[data-testid="perFileObjectSelector"]').exists()).toBe(false);
    const emitted = wrapper.emitted<unknown[]>();
    wrapper.unmount();
    expect(emitted.update_values).toHaveLength(EXPECTED_LENGTH);
    expect(emitted.update_values?.[FIRST_INDEX]?.[FIRST_INDEX]).toStrictEqual({
      geode_object_types: { "mesh.vtu": ["TriangulatedSurface3D", "TetrahedralSolid3D"] },
    });
  });

  test("a tie left by the backend is chosen by the user", async () => {
    // The solids tie: the backend selects nothing, the front must not pick the best surface
    const response: AllowedObjectsResponse = {
      allowed_objects: {
        TriangulatedSurface3D: { is_loadable: LOADABLE_SCORE, loadable_family: "SurfaceMesh" },
        TetrahedralSolid3D: { is_loadable: LESS_LOADABLE_SCORE, loadable_family: "SolidMesh" },
        HybridSolid3D: { is_loadable: LESS_LOADABLE_SCORE, loadable_family: "SolidMesh" },
      },
      objects_to_load: [],
    };
    registerEndpoint(allowed_objects.$id, {
      method: toHTTPMethod(allowed_objects.methods[FIRST_INDEX]),
      handler: () => response,
    });
    const wrapper = await mountSuspended(ObjectSelector, {
      global: { plugins: [vuetify, pinia] },
      props: { filenames: ["mesh.vtu"] },
    });
    await flushPromises();
    expect(wrapper.emitted().update_values).toBeUndefined();
    const v_cards = wrapper.findAllComponents(components.VCard);
    expect(v_cards).toHaveLength(Object.keys(response.allowed_objects).length);
    await v_cards[SECOND_INDEX]?.trigger("click");
    const emitted = wrapper.emitted<unknown[]>();
    wrapper.unmount();
    expect(emitted.update_values).toHaveLength(EXPECTED_LENGTH);
    expect(emitted.update_values?.[FIRST_INDEX]?.[FIRST_INDEX]).toStrictEqual({
      geode_object_types: { "mesh.vtu": ["TetrahedralSolid3D"] },
    });
  });
});
