// Not auto-fixable (eslint's sort-imports core rule has no autofixer) and this file's import order doesn't match its syntax-kind-then-alphabetical requirement - left as-is rather than manually reordered across the codebase for a purely cosmetic rule.
// oxlint-disable eslint/sort-imports
import * as components from "vuetify/components";
import { describe, expect, test, vi } from "vitest";
import { mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";

import { mockAs, setupActivePinia, toHTTPMethod, vuetify } from "@ogw_tests/utils";
import ObjectSelector from "@ogw_front/components/ObjectSelector.vue";
import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { useBackStore } from "@ogw_front/stores/back";

const EXPECTED_LENGTH = 1;
const FIRST_INDEX = 0;
const LOADABLE_SCORE = 1;
const PRIORITY_1 = 1;
const PRIORITY_2 = 2;

interface AllowedObjectInfo {
  is_loadable: boolean | number;
  object_priority?: number;
}
interface AllowedObjectsResponse {
  allowed_objects: Record<string, AllowedObjectInfo>;
}

const { allowed_objects } = schemas.opengeodeweb_back;

describe("object selector", () => {
  const pinia = setupActivePinia();
  const backStore = useBackStore();
  (backStore as { base_url: string }).base_url = "/";

  function mockAllowedObjects(
    byFile: Record<string, AllowedObjectsResponse["allowed_objects"]>,
  ): void {
    backStore.request = mockAs<typeof backStore.request>(
      vi.fn(async ({ params }: { params: { filename: string } }) => {
        await Promise.resolve();
        return { allowed_objects: byFile[params.filename] ?? {} };
      }),
    );
  }

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

  describe("several files", () => {
    test("files with different types are resolved without user input", async () => {
      mockAllowedObjects({
        "mesh.vtu": { SolidMesh3D: { is_loadable: LOADABLE_SCORE } },
        "model.og_brep": { BRep: { is_loadable: LOADABLE_SCORE } },
      });
      const wrapper = await mountSuspended(ObjectSelector, {
        global: { plugins: [vuetify, pinia] },
        props: { filenames: ["mesh.vtu", "model.og_brep"] },
      });
      await flushPromises();
      const emitted = wrapper.emitted<unknown[]>();
      wrapper.unmount();
      expect(emitted.update_values?.[FIRST_INDEX]?.[FIRST_INDEX]).toStrictEqual({
        geode_object_types: { "mesh.vtu": "SolidMesh3D", "model.og_brep": "BRep" },
      });
      expect(emitted.increment_step).toHaveLength(EXPECTED_LENGTH);
    });

    test("ambiguous files sharing types keep the single choice cards", async () => {
      const ambiguous = {
        BRep: { is_loadable: LOADABLE_SCORE },
        StructuralModel: { is_loadable: LOADABLE_SCORE },
      };
      mockAllowedObjects({
        "a.og_brep": ambiguous,
        "b.og_brep": ambiguous,
        "mesh.vtu": { SolidMesh3D: { is_loadable: LOADABLE_SCORE } },
      });
      const wrapper = await mountSuspended(ObjectSelector, {
        global: { plugins: [vuetify, pinia] },
        props: { filenames: ["a.og_brep", "b.og_brep", "mesh.vtu"] },
      });
      await flushPromises();
      expect(wrapper.find('[data-testid="perFileObjectSelector"]').exists()).toBe(false);
      expect(wrapper.text()).toContain("Choose the data type for: a.og_brep, b.og_brep");
      await wrapper.findComponent(components.VCard).trigger("click");
      const emitted = wrapper.emitted<unknown[]>();
      wrapper.unmount();
      expect(emitted.update_values?.[FIRST_INDEX]?.[FIRST_INDEX]).toStrictEqual({
        geode_object_types: { "a.og_brep": "BRep", "b.og_brep": "BRep", "mesh.vtu": "SolidMesh3D" },
      });
    });

    test("unsupported files are skipped and the others can still be imported", async () => {
      mockAllowedObjects({ "mesh.vtu": { SolidMesh3D: { is_loadable: LOADABLE_SCORE } } });
      const wrapper = await mountSuspended(ObjectSelector, {
        global: { plugins: [vuetify, pinia] },
        props: { filenames: ["mesh.vtu", "file.toto"] },
      });
      await flushPromises();
      expect(wrapper.text()).toContain("Not supported, will be skipped:");
      expect(wrapper.emitted().update_values).toBeUndefined();
      await wrapper.find('[data-testid="confirmDataTypesButton"]').trigger("click");
      const emitted = wrapper.emitted<unknown[]>();
      wrapper.unmount();
      expect(emitted.update_values?.[FIRST_INDEX]?.[FIRST_INDEX]).toStrictEqual({
        geode_object_types: { "mesh.vtu": "SolidMesh3D" },
      });
    });

    test("ambiguous files without a common type get one choice per group", async () => {
      mockAllowedObjects({
        "a.vtp": {
          PolygonalSurface3D: { is_loadable: LOADABLE_SCORE },
          TriangulatedSurface3D: { is_loadable: LOADABLE_SCORE },
        },
        "b.vtu": {
          SolidMesh3D: { is_loadable: LOADABLE_SCORE },
          HybridSolid3D: { is_loadable: LOADABLE_SCORE },
        },
      });
      const wrapper = await mountSuspended(ObjectSelector, {
        global: { plugins: [vuetify, pinia] },
        props: { filenames: ["a.vtp", "b.vtu"] },
      });
      await flushPromises();
      expect(wrapper.findAllComponents(components.VSelect)).toHaveLength(2);
      await wrapper.find('[data-testid="confirmDataTypesButton"]').trigger("click");
      const emitted = wrapper.emitted<unknown[]>();
      wrapper.unmount();
      expect(emitted.update_values?.[FIRST_INDEX]?.[FIRST_INDEX]).toStrictEqual({
        geode_object_types: { "a.vtp": "PolygonalSurface3D", "b.vtu": "SolidMesh3D" },
      });
    });
  });
});
