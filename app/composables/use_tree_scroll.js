export function useTreeScroll(scrollTopGetter, emit, displayItems, actualItemProps) {
  const SCROLL_STICKY_THRESHOLD = 10;
  const DEFAULT_ITEM_HEIGHT = 44;

  const internalScrollTop = ref(toValue(scrollTopGetter));
  const virtualScrollRef = ref(undefined);

  function handleScroll(event) {
    internalScrollTop.value = event.target.scrollTop;
    emit("update:scrollTop", event.target.scrollTop);
  }

  watch(
    () => toValue(scrollTopGetter),
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

    if (
      firstVisibleIndex < 0 ||
      firstVisibleIndex >= displayItems.value.length
    ) {
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
      if (
        item &&
        item.depth === 0 &&
        !item.isLeaf &&
        current < firstVisibleIndex
      ) {
        return item;
      }
      current -= 1;
    }
    return undefined;
  });

  return {
    internalScrollTop,
    virtualScrollRef,
    stickyHeader,
    handleScroll,
  };
}
