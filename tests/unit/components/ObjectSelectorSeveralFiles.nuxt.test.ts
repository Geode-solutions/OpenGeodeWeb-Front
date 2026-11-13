// Not auto-fixable (eslint's sort-imports core rule has no autofixer) and this file's import order doesn't match its syntax-kind-then-alphabetical requirement - left as-is rather than manually reordered across the codebase for a purely cosmetic rule.
// oxlint-disable eslint/sort-imports
import * as components from "vuetify/components";
import { describe, expect, test, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";

import { mockAs, setupActivePinia, vuetify } from "@ogw_tests/utils";
import ObjectSelector from "@ogw_front/components/ObjectSelector.vue";
import { useBackStore } from "@ogw_front/stores/back";
import {
  EXPECTED_LENGTH,
  FIRST_INDEX,
  LOADABLE_SCORE,
  type AllowedObjectsResponse,
} from "@ogw_tests/unit/components/ObjectSelectorHelpers";

const SECOND_INDEX = 1;
const LESS_LOADABLE_SCORE = 0.5;

describe("object selector", () => {
  const pinia = setupActivePinia();
  const backStore = useBackStore();
  (backStore as { base_url: string }).base_url = "/";

  function mockAllowedObjects(byFile: Record<string, AllowedObjectsResponse>): void {
    backStore.request = mockAs<typeof backStore.request>(
      vi.fn(async ({ params }: { params: { filename: string } }) => {
        await Promise.resolve();
        return byFile[params.filename] ?? { allowed_objects: {}, objects_to_load: [] };
      }),
    );
  }

  describe("several files", () => {
    test("files with different types are resolved without user input", async () => {
      mockAllowedObjects({
        "mesh.vtu": {
          allowed_objects: { SolidMesh3D: { is_loadable: LOADABLE_SCORE } },
          objects_to_load: ["SolidMesh3D"],
        },
        "model.og_brep": {
          allowed_objects: { BRep: { is_loadable: LOADABLE_SCORE } },
          objects_to_load: ["BRep"],
        },
      });
      const wrapper = await mountSuspended(ObjectSelector, {
        global: { plugins: [vuetify, pinia] },
        props: { filenames: ["mesh.vtu", "model.og_brep"] },
      });
      await flushPromises();
      const emitted = wrapper.emitted<unknown[]>();
      wrapper.unmount();
      expect(emitted.update_values?.[FIRST_INDEX]?.[FIRST_INDEX]).toStrictEqual({
        geode_object_types: { "mesh.vtu": ["SolidMesh3D"], "model.og_brep": ["BRep"] },
      });
      expect(emitted.increment_step).toHaveLength(EXPECTED_LENGTH);
    });

    test("ambiguous files sharing types keep the single choice cards", async () => {
      const ambiguous = {
        BRep: { is_loadable: LOADABLE_SCORE },
        StructuralModel: { is_loadable: LOADABLE_SCORE },
      };
      mockAllowedObjects({
        "a.og_brep": { allowed_objects: ambiguous, objects_to_load: [] },
        "b.og_brep": { allowed_objects: ambiguous, objects_to_load: [] },
        "mesh.vtu": {
          allowed_objects: { SolidMesh3D: { is_loadable: LOADABLE_SCORE } },
          objects_to_load: ["SolidMesh3D"],
        },
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
        geode_object_types: {
          "a.og_brep": ["BRep"],
          "b.og_brep": ["BRep"],
          "mesh.vtu": ["SolidMesh3D"],
        },
      });
    });

    test("unsupported files are skipped and the others can still be imported", async () => {
      mockAllowedObjects({
        "mesh.vtu": {
          allowed_objects: { SolidMesh3D: { is_loadable: LOADABLE_SCORE } },
          objects_to_load: ["SolidMesh3D"],
        },
      });
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
        geode_object_types: { "mesh.vtu": ["SolidMesh3D"] },
      });
    });

    test("ambiguous files without a common type get one choice per group", async () => {
      mockAllowedObjects({
        "a.vtp": {
          allowed_objects: {
            PolygonalSurface3D: { is_loadable: LOADABLE_SCORE },
            TriangulatedSurface3D: { is_loadable: LOADABLE_SCORE },
          },
          objects_to_load: [],
        },
        "b.vtu": {
          allowed_objects: {
            SolidMesh3D: { is_loadable: LOADABLE_SCORE },
            HybridSolid3D: { is_loadable: LOADABLE_SCORE },
          },
          objects_to_load: [],
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
        geode_object_types: { "a.vtp": ["PolygonalSurface3D"], "b.vtu": ["SolidMesh3D"] },
      });
    });

    test("a mixed file shows one chip per content next to a skipped file", async () => {
      mockAllowedObjects({
        "mesh.vtu": {
          allowed_objects: {
            TriangulatedSurface3D: { is_loadable: LOADABLE_SCORE, loadable_family: "SurfaceMesh" },
            TetrahedralSolid3D: { is_loadable: LOADABLE_SCORE, loadable_family: "SolidMesh" },
          },
          objects_to_load: ["TriangulatedSurface3D", "TetrahedralSolid3D"],
        },
      });
      const wrapper = await mountSuspended(ObjectSelector, {
        global: { plugins: [vuetify, pinia] },
        props: { filenames: ["mesh.vtu", "file.toto"] },
      });
      await flushPromises();
      expect(wrapper.text()).toContain("TriangulatedSurface3D");
      expect(wrapper.text()).toContain("TetrahedralSolid3D");
      await wrapper.find('[data-testid="confirmDataTypesButton"]').trigger("click");
      const emitted = wrapper.emitted<unknown[]>();
      wrapper.unmount();
      expect(emitted.update_values?.[FIRST_INDEX]?.[FIRST_INDEX]).toStrictEqual({
        geode_object_types: { "mesh.vtu": ["TriangulatedSurface3D", "TetrahedralSolid3D"] },
      });
    });

    test("files the backend could not decide are never picked by the front", async () => {
      // The solids tie: the backend selects nothing, the best surface must not be picked
      const tie = {
        allowed_objects: {
          TriangulatedSurface3D: { is_loadable: LOADABLE_SCORE, loadable_family: "SurfaceMesh" },
          TetrahedralSolid3D: { is_loadable: LESS_LOADABLE_SCORE, loadable_family: "SolidMesh" },
          HybridSolid3D: { is_loadable: LESS_LOADABLE_SCORE, loadable_family: "SolidMesh" },
        },
        objects_to_load: [],
      };
      mockAllowedObjects({ "a.vtu": tie, "b.vtu": tie });
      const wrapper = await mountSuspended(ObjectSelector, {
        global: { plugins: [vuetify, pinia] },
        props: { filenames: ["a.vtu", "b.vtu"] },
      });
      await flushPromises();
      expect(wrapper.emitted().update_values).toBeUndefined();
      const v_cards = wrapper.findAllComponents(components.VCard);
      expect(v_cards).toHaveLength(Object.keys(tie.allowed_objects).length);
      await v_cards[SECOND_INDEX]?.trigger("click");
      const emitted = wrapper.emitted<unknown[]>();
      wrapper.unmount();
      expect(emitted.update_values).toHaveLength(EXPECTED_LENGTH);
      expect(emitted.update_values?.[FIRST_INDEX]?.[FIRST_INDEX]).toStrictEqual({
        geode_object_types: { "a.vtu": ["TetrahedralSolid3D"], "b.vtu": ["TetrahedralSolid3D"] },
      });
    });
  });
});
