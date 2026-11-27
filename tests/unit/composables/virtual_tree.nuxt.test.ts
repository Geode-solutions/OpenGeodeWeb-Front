// Only ever fires now that tests are .ts; asks every bare `vi.fn()` mock to carry an explicit call-signature type parameter. Real value for a handful of mocks, but for the many plain mock objects across this test suite it would mean guessing a signature that's already implied by how the mock is used (risking a type that quietly doesn't match, which defeats the point) rather than deriving it from each real function - left off rather than doing that at scale.
// oxlint-disable vitest/require-mock-type-parameters
import { type EmitFn, useVirtualTree } from "@ogw_front/composables/virtual_tree";
import {
  boundaries,
  rows,
  setupDetailsTree,
  surface,
  surfaces,
} from "@ogw_tests/unit/helpers/virtual_tree";
import { describe, expect, test, vi } from "vitest";
import { nextTick, ref } from "vue";

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

    const emit = vi.fn<EmitFn>();
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

  describe("details", () => {
    test("an item with details is an expandable leaf", () => {
      const { tree } = setupDetailsTree();
      expect(rows(tree)).toStrictEqual([
        ["Surface", 0, false, true],
        ["S", 1, true, true],
        ["T", 1, true, false],
      ]);
    });

    test("opening an item lists its details under it", () => {
      const { tree } = setupDetailsTree({ opened: ["Surface", "S", "S:boundaries"] });
      expect(rows(tree)).toStrictEqual([
        ["Surface", 0, false, true],
        ["S", 1, true, true],
        ["S:boundaries", 2, false, true],
        ["line1", 3, true, false],
        ["line2", 3, true, false],
        ["T", 1, true, false],
      ]);
    });

    test("details are hidden while searching", () => {
      const { tree } = setupDetailsTree({
        opened: ["Surface", "S", "S:boundaries"],
        search: "Surface S",
      });
      expect(rows(tree)).toStrictEqual([
        ["Surface", 0, false, true],
        ["S", 1, true, false],
      ]);
    });

    test("selecting an item with details only selects the item itself", () => {
      const { tree, emit } = setupDetailsTree();
      tree.toggleSelect(surface);
      expect(emit).toHaveBeenLastCalledWith("update:selected", ["S"]);

      tree.toggleSelect(surfaces);
      expect(emit).toHaveBeenLastCalledWith("update:selected", ["Surface", "S", "T"]);
    });

    test("an item visibility does not depend on its details", () => {
      const { tree } = setupDetailsTree({ selected: ["line1", "line2"] });
      expect(tree.isSelected(surface)).toBe(false);
      expect(tree.getIndeterminate(surface)).toBe(false);
      expect(tree.isSelected(boundaries)).toBe(true);
      expect(tree.isSelected(surfaces)).toBe(false);
    });

    test("selecting a details group selects its components", () => {
      const { tree, emit } = setupDetailsTree({ selected: ["S"] });
      tree.toggleSelect(boundaries);
      expect(emit).toHaveBeenLastCalledWith("update:selected", [
        "S",
        "S:boundaries",
        "line1",
        "line2",
      ]);
      expect(tree.isSelected(surface)).toBe(true);
    });
  });

  describe("search", () => {
    const leaf = { id: "leaf", title: "Leaf" };
    const inner = { id: "inner", title: "Inner", children: [leaf] };
    const other = {
      id: "other",
      title: "Other",
      children: [{ id: "otherLeaf", title: "Other leaf" }],
    };
    const root = { id: "root", title: "Root", children: [inner, other] };

    test("clearing the search reopens the groups opened before it", async () => {
      const props = ref({ items: [root], opened: ["root"], search: "" });
      const emit = vi.fn<EmitFn>();
      useVirtualTree(props, emit);

      props.value.search = "lea";
      await nextTick();
      expect(emit).toHaveBeenLastCalledWith("update:opened", ["root", "inner", "other"]);
      // As the tree owner does
      props.value.opened = ["root", "inner", "other"];
      emit.mockClear();

      props.value.search = "leaf";
      await nextTick();
      // Typing on does not open the groups again
      expect(emit).not.toHaveBeenCalled();

      props.value.search = "";
      await nextTick();
      expect(emit).toHaveBeenLastCalledWith("update:opened", ["root"]);
    });
  });
});
