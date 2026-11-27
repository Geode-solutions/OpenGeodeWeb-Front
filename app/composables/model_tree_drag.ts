import type { TreeViewId } from "@ogw_front/types/identifiers";
import type { TreeViewIndex } from "@ogw_front/types/tree";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

// A drop target has to accept the drag over it
function onDragOver(event: DragEvent): void {
  event.preventDefault();
}

// Model trees are reordered by dragging their panel header or their button in the activity bar
export function useModelTreeDrag(): {
  draggedId: Ref<TreeViewId | undefined>;
  dropTargetId: Ref<TreeViewId | undefined>;
  onDragStart: (id: TreeViewId) => void;
  onDragOver: (event: DragEvent) => void;
  onDragEnd: () => void;
  onDrop: (targetId: TreeViewId) => void;
  dropSide: (targetId: TreeViewId) => string | undefined;
} {
  const treeviewStore = useTreeviewStore();
  const draggedId = ref<TreeViewId | undefined>(undefined);
  // Model button hovered while dragging another one: the line shows where the dragged one lands
  const dropTargetId = ref<TreeViewId | undefined>(undefined);

  function viewIndex(id: TreeViewId): TreeViewIndex {
    return treeviewStore.opened_views.findIndex((view) => view.id === id);
  }

  function onDragStart(id: TreeViewId): void {
    draggedId.value = id;
  }

  function onDragEnd(): void {
    draggedId.value = undefined;
    dropTargetId.value = undefined;
  }

  function onDrop(targetId: TreeViewId): void {
    if (draggedId.value !== undefined && draggedId.value !== targetId) {
      treeviewStore.moveView(viewIndex(draggedId.value), viewIndex(targetId));
    }
    onDragEnd();
  }

  // The dragged tree takes the place of the target: before it when moving up, after it when moving down
  function dropSide(targetId: TreeViewId): string | undefined {
    if (
      draggedId.value === undefined ||
      dropTargetId.value !== targetId ||
      draggedId.value === targetId
    ) {
      return undefined;
    }
    return viewIndex(draggedId.value) > viewIndex(targetId) ? "drop-before" : "drop-after";
  }

  return { draggedId, dropTargetId, onDragStart, onDragOver, onDragEnd, onDrop, dropSide };
}
