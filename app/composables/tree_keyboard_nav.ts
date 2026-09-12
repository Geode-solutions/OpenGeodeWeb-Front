import type { Ref } from "vue";
import type { DisplayItem, EmitFn } from "./virtual_tree";

interface VisibleBounds {
  firstVisible: number;
  lastVisible: number;
}

interface ScrollInfo {
  scrollTop: number;
  containerHeight: number;
  itemHeight: number;
}

function getBaseIndex(
  currentIndex: number,
  lastIndex: number,
  bounds: VisibleBounds | undefined,
  key: string,
): number {
  if (currentIndex < 0 || currentIndex > lastIndex) {
    if (bounds) {
      return key === "End" ? lastIndex : bounds.firstVisible;
    }
    return key === "End" ? lastIndex : 0;
  }
  if (bounds) {
    if (currentIndex < bounds.firstVisible - 2) {
      return bounds.firstVisible;
    }
    if (currentIndex > bounds.lastVisible + 2) {
      return bounds.lastVisible;
    }
  }
  return currentIndex;
}

export function useTreeKeyboardNav(
  displayItems: Ref<DisplayItem[]>,
  emit: EmitFn,
  scrollToIndex: (index: number) => void,
  toggleOpen: (raw: Record<string, unknown>) => void,
  handleItemClick: (item: DisplayItem, index: number) => void,
  getScrollInfo: (() => ScrollInfo | undefined) | undefined,
  externalFocusedIndex: Ref<number> | undefined,
) {
  const focusedIndex = externalFocusedIndex || ref(-1);

  function findParentIndex(item: DisplayItem, currentIndex: number): number {
    for (let index = currentIndex - 1; index >= 0; index -= 1) {
      const candidate = displayItems.value[index];
      if (candidate && candidate.depth < item.depth) {
        return index;
      }
    }
    return -1;
  }

  function getVisibleBounds(): VisibleBounds | undefined {
    if (!getScrollInfo) {
      return undefined;
    }
    const info = getScrollInfo();
    if (!info || !info.itemHeight || info.itemHeight <= 0) {
      return undefined;
    }
    const firstVisible = Math.max(0, Math.floor(info.scrollTop / info.itemHeight));
    const visibleCount =
      info.containerHeight > 0 ? Math.floor(info.containerHeight / info.itemHeight) : 1;
    const lastVisible = Math.max(firstVisible, firstVisible + visibleCount - 1);
    return { firstVisible, lastVisible };
  }

  function handleExpandOrNext(
    item: DisplayItem | undefined,
    currentIndex: number,
    lastIndex: number,
  ): number {
    if (item && !item.isLeaf && !item.isOpen) {
      toggleOpen(item.raw);
      return currentIndex;
    }
    return Math.min(currentIndex + 1, lastIndex);
  }

  function handleCollapseOrParent(item: DisplayItem | undefined, currentIndex: number): number {
    if (item && !item.isLeaf && item.isOpen) {
      toggleOpen(item.raw);
      return currentIndex;
    }
    if (item) {
      const parentIndex = findParentIndex(item, currentIndex);
      return parentIndex === -1 ? currentIndex : parentIndex;
    }
    return currentIndex;
  }

  function getNextIndex(key: string): number {
    const total = displayItems.value.length;
    if (total === 0) {
      return -1;
    }
    const lastIndex = total - 1;
    const rawIndex = getBaseIndex(focusedIndex.value, lastIndex, getVisibleBounds(), key);
    const currentIndex = Math.max(0, Math.min(rawIndex, lastIndex));
    const item = displayItems.value[currentIndex];

    if (key === "ArrowDown") {
      return Math.min(currentIndex + 1, lastIndex);
    }
    if (key === "ArrowUp") {
      return Math.max(currentIndex - 1, 0);
    }
    if (key === "Home") {
      return 0;
    }
    if (key === "End") {
      return lastIndex;
    }
    if (key === "ArrowRight") {
      return handleExpandOrNext(item, currentIndex, lastIndex);
    }
    if (key === "ArrowLeft") {
      return handleCollapseOrParent(item, currentIndex);
    }

    return currentIndex;
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (displayItems.value.length === 0) {
      return;
    }

    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const prevIndex = focusedIndex.value;
      focusedIndex.value = getNextIndex(event.key);

      if (focusedIndex.value !== prevIndex) {
        if (prevIndex >= 0 && prevIndex < displayItems.value.length) {
          emit("hover:leave", { item: displayItems.value[prevIndex] });
        }
        if (focusedIndex.value >= 0 && focusedIndex.value < displayItems.value.length) {
          emit("hover:enter", {
            immediate: true,
            item: displayItems.value[focusedIndex.value],
          });
        }
        scrollToIndex(focusedIndex.value);
      }
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (focusedIndex.value >= 0 && focusedIndex.value < displayItems.value.length) {
        const item = displayItems.value[focusedIndex.value];
        if (item) {
          handleItemClick(item, focusedIndex.value);
        }
      }
    }
  }

  return { focusedIndex, handleKeyDown };
}
