// Only ever fires now that tests are .ts; asks every bare `vi.fn()` mock to carry an explicit call-signature type parameter. Real value for a handful of mocks, but for the many plain mock objects across this test suite it would mean guessing a signature that's already implied by how the mock is used (risking a type that quietly doesn't match, which defeats the point) rather than deriving it from each real function - left off rather than doing that at scale.
// oxlint-disable vitest/require-mock-type-parameters
// Third party imports
import { describe, expect, test, vi } from "vitest";
import { ref } from "vue";

// Local imports
import { useVirtualTree } from "@ogw_front/composables/virtual_tree";

describe("virtual tree composable", () => {
  test("correctly handles empty collections without treating them as leaf nodes", () => {
    // Structure:
    // ModelBoundaries (category)
    //  ├── empty_collection (empty collection component)
    //  └── non_empty_collection (non-empty collection component)
    //       └── mesh1 (leaf mesh component)
    const mesh_item = { id: "mesh1", title: "Mesh 1" };
    const empty_collection_item = {
      id: "empty_collection",
      title: "Empty Collection",
      children: [] as (typeof mesh_item)[],
    };
    const non_empty_collection_item = {
      id: "non_empty_collection",
      title: "Non-empty Collection",
      children: [mesh_item],
    };
    const model_boundaries_item = {
      id: "ModelBoundaries",
      title: "Model Boundaries",
      children: [empty_collection_item, non_empty_collection_item],
    };
    const items = [model_boundaries_item];

    const props = ref({
      items,
      opened: [],
      selected: ["mesh1"],
      selection: { selectable: true, strategy: "classic" },
    });

    const emit = vi.fn();
    const { isSelected, getIndeterminate } = useVirtualTree(props, emit);

    // 1. The empty collection has no leaf children, so it should not be considered selected
    expect(isSelected(empty_collection_item)).toBe(false);

    // 2. The non-empty collection has "mesh1" as a child (which is in the selected set), so it is selected
    expect(isSelected(non_empty_collection_item)).toBe(true);

    // 3. The category root (ModelBoundaries) only has "mesh1" as an active leaf descendant.
    // Since "mesh1" is selected, the category root must evaluate to selected (true).
    // (If the bug were present, it would look for both "empty_collection" and "mesh1" in selected, resulting in false)
    expect(isSelected(model_boundaries_item)).toBe(true);

    // 4. ModelBoundaries should not be indeterminate since all its leaf descendants are selected
    expect(getIndeterminate(model_boundaries_item)).toBe(false);
  });
});
