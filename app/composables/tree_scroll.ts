import type { DisplayItem, EmitFn, ItemPropsConfig } from "./virtual_tree";

interface TreeScrollProps {
  scrollTop?: number;
}

interface ScrollableElement {
  $el: { scrollTop: number; clientHeight: number } | undefined;
}

interface ScrollInfo {
  scrollTop: number;
  containerHeight: number;
  itemHeight: number;
}

type ReadonlyMaybeRefOrGetter<Value> = Value | Ref<Value> | (() => Value);

type ReadonlyDisplayItem = Omit<DisplayItem, "raw"> & {
  readonly raw: Record<string, unknown>;
};

interface ScrollEventLike {
  readonly target: EventTarget | null;
}

interface UseTreeScrollReturn {
  internalScrollTop: Ref<number>;
  virtualScrollRef: Ref<ScrollableElement | undefined>;
  stickyHeader: ComputedRef<ReadonlyDisplayItem | undefined>;
  handleScroll: (event: ScrollEventLike) => void;
  scrollToIndex: (index: number) => void;
  getScrollInfo: () => ScrollInfo;
}

function isHtmlElement(value: EventTarget | null): value is HTMLElement {
  return value instanceof HTMLElement;
}

export function useTreeScroll(
  propsIn: ReadonlyMaybeRefOrGetter<TreeScrollProps>,
  emit: EmitFn,
  displayItems: Ref<readonly ReadonlyDisplayItem[]>,
  actualItemProps: Ref<ItemPropsConfig>,
): UseTreeScrollReturn {
  const SCROLL_STICKY_THRESHOLD = 10;
  const DEFAULT_ITEM_HEIGHT = 28;

  const props = toRef(propsIn);
  const internalScrollTop = ref(props.value.scrollTop ?? 0);
  const virtualScrollRef = ref<ScrollableElement | undefined>(undefined);

  function handleScroll(event: ScrollEventLike): void {
    const { target } = event;
    if (!isHtmlElement(target)) {
      return;
    }
    const { scrollTop } = target;
    internalScrollTop.value = scrollTop;
    emit("update:scrollTop", scrollTop);
  }

  watch(
    () => props.value.scrollTop,
    (newVal = 0) => {
      if (Math.abs(newVal - internalScrollTop.value) > 1) {
        internalScrollTop.value = newVal;
        if (virtualScrollRef.value !== undefined && virtualScrollRef.value.$el !== undefined) {
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
    if (index === -1 || virtualScrollRef.value === undefined) {
      return;
    }

    const container = virtualScrollRef.value.$el;
    if (container === undefined) {
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

  function getScrollInfo(): ScrollInfo {
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
