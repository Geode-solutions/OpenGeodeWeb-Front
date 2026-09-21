// Not auto-fixable (eslint's sort-imports core rule has no autofixer) and this file's import order doesn't match its syntax-kind-then-alphabetical requirement - left as-is rather than manually reordered across the codebase for a purely cosmetic rule.
// oxlint-disable eslint/sort-imports
import type { MaybeRefOrGetter, Ref } from "vue";
import type { DisplayItem, EmitFn, ItemPropsConfig } from "./virtual_tree";

interface TreeScrollProps {
  scrollTop?: number;
}

interface ScrollableElement {
  $el: { scrollTop: number; clientHeight: number };
}

export function useTreeScroll(
  propsIn: MaybeRefOrGetter<TreeScrollProps>,
  emit: EmitFn,
  displayItems: Ref<DisplayItem[]>,
  actualItemProps: Ref<ItemPropsConfig>,
) {
  const SCROLL_STICKY_THRESHOLD = 10;
  const DEFAULT_ITEM_HEIGHT = 28;

  const props = toRef(propsIn);
  const internalScrollTop = ref(props.value.scrollTop || 0);
  const virtualScrollRef = ref<ScrollableElement | undefined>(undefined);

  function handleScroll(event: Event): void {
    const { scrollTop } = event.target as HTMLElement;
    internalScrollTop.value = scrollTop;
    emit("update:scrollTop", scrollTop);
  }

  watch(
    () => props.value.scrollTop,
    (newVal = 0) => {
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

  function scrollToIndex(index: number): void {
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

  function getScrollInfo() {
    const container = virtualScrollRef.value?.$el;
    const containerHeight = container ? container.clientHeight : 0;
    const itemHeight = actualItemProps.value?.height || DEFAULT_ITEM_HEIGHT;
    return {
      scrollTop: internalScrollTop.value,
      containerHeight,
      itemHeight,
    };
  }

  return {
    internalScrollTop,
    virtualScrollRef,
    stickyHeader,
    handleScroll,
    scrollToIndex,
    getScrollInfo,
  };
}
