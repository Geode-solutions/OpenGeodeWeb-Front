export function useTreeScroll(propsIn, emit, displayItems, actualItemProps) {
  const SCROLL_STICKY_THRESHOLD = 10;
  const DEFAULT_ITEM_HEIGHT = 44;

  const props = toRef(propsIn);
  const internalScrollTop = ref(props.value.scrollTop || 0);
  const virtualScrollRef = ref(undefined);

  function handleScroll(event) {
    internalScrollTop.value = event.target.scrollTop;
    emit("update:scrollTop", event.target.scrollTop);
  }

  watch(
    () => props.value.scrollTop,
    (newVal) => {
      if (Math.abs(newVal - internalScrollTop.value) > 1) {
        internalScrollTop.value = newVal;
        if (virtualScrollRef.value && virtualScrollRef.value.$el) {
          virtualScrollRef.value.$el.scrollTop = newVal;
        }
      }
    },
  );

  const stickyHeader = computed(() => {
    if (internalScrollTop.value <= SCROLL_STICKY_THRESHOLD) {
      return undefined;
    }

    const itemHeight = actualItemProps.value.height || DEFAULT_ITEM_HEIGHT;
    const firstVisibleIndex = Math.floor(internalScrollTop.value / itemHeight);

    if (firstVisibleIndex < 0 || firstVisibleIndex >= displayItems.value.length) {
      return undefined;
    }

    const firstVisibleItem = displayItems.value[firstVisibleIndex];
    if (!firstVisibleItem) {
      return undefined;
    }

    let current = firstVisibleIndex;
    const firstVisibleDepth = firstVisibleItem.depth;

    while (current >= 0) {
      const item = displayItems.value[current];
      if (item && !item.isLeaf && item.depth < firstVisibleDepth) {
        return item;
      }
      if (item && item.depth === 0 && !item.isLeaf && current < firstVisibleIndex) {
        return item;
      }
      current -= 1;
    }
    return undefined;
  });

  function scrollToIndex(index) {
    if (index === -1 || !virtualScrollRef.value) {
      return;
    }

    const container = virtualScrollRef.value.$el;
    if (!container) {
      return;
    }

    const itemHeight = actualItemProps.value.height;
    const itemTop = index * itemHeight;
    const itemBottom = itemTop + itemHeight;

    const currentScrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const scrollBottom = currentScrollTop + containerHeight;

    if (itemTop < currentScrollTop) {
      container.scrollTop = itemTop;
    } else if (itemBottom > scrollBottom) {
      container.scrollTop = itemBottom - containerHeight;
    }
  }

  return {
    internalScrollTop,
    virtualScrollRef,
    stickyHeader,
    handleScroll,
    scrollToIndex,
  };
}
