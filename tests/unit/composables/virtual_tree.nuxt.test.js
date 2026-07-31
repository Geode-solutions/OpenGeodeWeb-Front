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
    const items = [
      {
        id: "ModelBoundaries",
        title: "Model Boundaries",
        children: [
          {
            id: "empty_collection",
            title: "Empty Collection",
            children: [],
          },
          {
            id: "non_empty_collection",
            title: "Non-empty Collection",
            children: [
              {
                id: "mesh1",
                title: "Mesh 1",
              },
            ],
          },
        ],
      },
    ];

    const props = ref({
      items,
      opened: [],
      selected: ["mesh1"],
      selection: { selectable: true, strategy: "classic" },
    });

    const emit = vi.fn();
    const { isSelected, getIndeterminate } = useVirtualTree(props, emit);

    // 1. The empty collection has no leaf children, so it should not be considered selected
    expect(isSelected(items[0].children[0])).toBe(false);

    // 2. The non-empty collection has "mesh1" as a child (which is in the selected set), so it is selected
    expect(isSelected(items[0].children[1])).toBe(true);

    // 3. The category root (ModelBoundaries) only has "mesh1" as an active leaf descendant.
    // Since "mesh1" is selected, the category root must evaluate to selected (true).
    // (If the bug were present, it would look for both "empty_collection" and "mesh1" in selected, resulting in false)
    expect(isSelected(items[0])).toBe(true);

    // 4. ModelBoundaries should not be indeterminate since all its leaf descendants are selected
    expect(getIndeterminate(items[0])).toBe(false);
  });
});
