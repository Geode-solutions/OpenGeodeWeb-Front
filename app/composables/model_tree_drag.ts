import { useTreeviewStore } from "@ogw_front/stores/treeview";

// A drop target has to accept the drag over it
function onDragOver(event: DragEvent): void {
  event.preventDefault();
}

// Model trees are reordered by dragging their panel header or their button in the activity bar
export function useModelTreeDrag(): {
  draggedId: Ref<string | undefined>;
  dropTargetId: Ref<string | undefined>;
  onDragStart: (id: string) => void;
  onDragOver: (event: DragEvent) => void;
  onDragEnd: () => void;
  onDrop: (targetId: string) => void;
  dropSide: (targetId: string) => string | undefined;
} {
  const treeviewStore = useTreeviewStore();
  const draggedId = ref<string | undefined>(undefined);
  // Model button hovered while dragging another one: the line shows where the dragged one lands
  const dropTargetId = ref<string | undefined>(undefined);

  function viewIndex(id: string): number {
    return treeviewStore.opened_views.findIndex((view) => view.id === id);
  }

  function onDragStart(id: string): void {
    draggedId.value = id;
  }

  function onDragEnd(): void {
    draggedId.value = undefined;
    dropTargetId.value = undefined;
  }

  function onDrop(targetId: string): void {
    if (draggedId.value !== undefined && draggedId.value !== targetId) {
      treeviewStore.moveView(viewIndex(draggedId.value), viewIndex(targetId));
    }
    onDragEnd();
  }

  // The dragged tree takes the place of the target: before it when moving up, after it when moving down
  function dropSide(targetId: string): string | undefined {
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
