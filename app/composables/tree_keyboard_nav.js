export function useTreeKeyboardNav(displayItems, emit, scrollToIndex, toggleOpen, handleItemClick) {
  const focusedIndex = ref(-1);

  function findParentIndex(item, currentIndex) {
    for (let index = currentIndex - 1; index >= 0; index -= 1) {
      if (displayItems.value[index].depth < item.depth) {
        return index;
      }
    }
    return -1;
  }

  function getNextIndex(key, item) {
    const lastIndex = displayItems.value.length - 1;
    const currentIndex = focusedIndex.value;

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
      if (!item.isLeaf && !item.isOpen) {
        toggleOpen(item.raw);
        return currentIndex;
      }
      return Math.min(currentIndex + 1, lastIndex);
    }

    if (key === "ArrowLeft") {
      if (!item.isLeaf && item.isOpen) {
        toggleOpen(item.raw);
        return currentIndex;
      }
      const parentIndex = findParentIndex(item, currentIndex);
      return parentIndex === -1 ? currentIndex : parentIndex;
    }

    return currentIndex;
  }

  function handleKeyDown(event) {
    if (displayItems.value.length === 0) {
      return;
    }

    const prevIndex = focusedIndex.value;
    const item = displayItems.value[focusedIndex.value];

    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      focusedIndex.value = getNextIndex(event.key, item);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (focusedIndex.value !== -1) {
        handleItemClick(item);
      }
    }

    if (focusedIndex.value !== prevIndex) {
      if (prevIndex !== -1) {
        emit("hover:leave", { item: displayItems.value[prevIndex] });
      }
      emit("hover:enter", {
        item: displayItems.value[focusedIndex.value],
        immediate: true,
      });
      scrollToIndex(focusedIndex.value);
    }
  }

  return { focusedIndex, handleKeyDown };
}
