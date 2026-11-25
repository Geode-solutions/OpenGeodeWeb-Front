// Third party imports
import { beforeEach, describe, expect, test } from "vitest";

// Local imports
import { setupActivePinia } from "@ogw_tests/utils";
import { useModelTreeDrag } from "@ogw_front/composables/model_tree_drag";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

function openTrees(): ReturnType<typeof useTreeviewStore> {
  const treeviewStore = useTreeviewStore();
  treeviewStore.displayAdditionalTree("a", "corbi", "BRep");
  treeviewStore.displayAdditionalTree("b", "cube", "BRep");
  treeviewStore.displayAdditionalTree("c", "test", "BRep");
  return treeviewStore;
}

describe("model tree drag", () => {
  beforeEach(() => {
    setupActivePinia();
  });

  test("the line shows before the target when moving up, after it when moving down", () => {
    openTrees();
    const drag = useModelTreeDrag();
    drag.onDragStart("b");
    drag.dropTargetId.value = "a";
    expect(drag.dropSide("a")).toBe("drop-before");
    expect(drag.dropSide("c")).toBeUndefined();
    drag.dropTargetId.value = "c";
    expect(drag.dropSide("c")).toBe("drop-after");
  });

  test("dropping moves the dragged tree to the target place", () => {
    const treeviewStore = openTrees();
    const drag = useModelTreeDrag();
    drag.onDragStart("c");
    drag.onDrop("a");
    expect(treeviewStore.opened_views.map((view) => view.id)).toStrictEqual([
      "main",
      "c",
      "a",
      "b",
    ]);
    expect(drag.draggedId.value).toBeUndefined();
  });

  test("a drag ended anywhere else leaves no drop state", () => {
    openTrees();
    const drag = useModelTreeDrag();
    drag.onDragStart("a");
    drag.dropTargetId.value = "b";
    drag.onDragEnd();
    expect(drag.draggedId.value).toBeUndefined();
    expect(drag.dropSide("b")).toBeUndefined();
  });
});
