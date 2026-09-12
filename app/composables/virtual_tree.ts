import type { MaybeRefOrGetter } from "vue";

export type TreeItem = Record<string, unknown>;

export interface ItemPropsConfig {
  value: string;
  title: string;
  children: string;
  height: number;
  [key: string]: unknown;
}

export interface SelectionConfig {
  selectable: boolean;
  strategy: string;
  [key: string]: unknown;
}

interface VirtualTreeProps {
  items?: TreeItem[];
  opened?: unknown[];
  selected?: unknown[];
  active?: unknown[];
  itemProps?: Partial<ItemPropsConfig>;
  selection?: Partial<SelectionConfig>;
  search?: string;
  customFilter?: (id: unknown, search: string, context: { raw: TreeItem }) => boolean;
}

export interface DisplayItem {
  raw: TreeItem;
  id: unknown;
  depth: number;
  isOpen: boolean;
  isActive: boolean;
  isLeaf: boolean;
}

export type EmitFn = (event: string, ...args: unknown[]) => void;

export function useVirtualTree(propsIn: MaybeRefOrGetter<VirtualTreeProps>, emit: EmitFn) {
  const props = toRef(propsIn);

  const actualItemProps = computed<ItemPropsConfig>(() => ({
    value: "id",
    title: "title",
    children: "children",
    height: 28,
    ...props.value.itemProps,
  }));

  const actualSelection = computed<SelectionConfig>(() => ({
    selectable: false,
    strategy: "classic",
    ...props.value.selection,
  }));

  const openedSet = computed(() => new Set(props.value.opened));
  const selectedSet = computed(() => new Set(props.value.selected));
  const activeSet = computed(() => new Set(props.value.active || []));

  function toggleOpen(item: TreeItem): void {
    const id = item[actualItemProps.value.value];
    const { opened: openedArray = [] } = props.value;
    const newOpened = new Set(openedArray);
    if (newOpened.has(id)) {
      newOpened.delete(id);
    } else {
      newOpened.add(id);
    }
    emit("update:opened", [...newOpened]);
  }

  function getLeafChildrenIds(item: TreeItem, ids: unknown[] = []): unknown[] {
    const children = item[actualItemProps.value.children] as TreeItem[] | undefined;
    if (children) {
      for (const child of children) {
        getLeafChildrenIds(child, ids);
      }
    } else {
      ids.push(item[actualItemProps.value.value]);
    }
    return ids;
  }

  function isSelected(item: TreeItem): boolean {
    const id = item[actualItemProps.value.value];
    if (selectedSet.value.has(id)) {
      return true;
    }
    if (actualSelection.value.strategy === "classic") {
      const childrenIds = getLeafChildrenIds(item);
      return (
        childrenIds.length > 0 && childrenIds.every((childId) => selectedSet.value.has(childId))
      );
    }
    return false;
  }

  function getIndeterminate(item: TreeItem): boolean {
    if (actualSelection.value.strategy !== "classic") {
      return false;
    }
    const childrenIds = getLeafChildrenIds(item);
    if (childrenIds.length === 0) {
      return false;
    }

    const selectedChildren = childrenIds.filter((childId) => selectedSet.value.has(childId));
    return selectedChildren.length > 0 && selectedChildren.length < childrenIds.length;
  }

  function toggleSelect(item: TreeItem): void {
    const id = item[actualItemProps.value.value];
    const { selected: selectedArray = [] } = props.value;
    const newSelected = new Set(selectedArray);
    const isCurrentlySelected = newSelected.has(id) || isSelected(item);

    if (actualSelection.value.strategy === "classic") {
      const childrenIds = getLeafChildrenIds(item);
      if (isCurrentlySelected) {
        newSelected.delete(id);
        for (const childId of childrenIds) {
          newSelected.delete(childId);
        }
      } else {
        newSelected.add(id);
        for (const childId of childrenIds) {
          newSelected.add(childId);
        }
      }
    } else if (isCurrentlySelected) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    emit("update:selected", [...newSelected]);
  }

  function flattenTree(
    itemsList: TreeItem[],
    depth = 0,
    result: DisplayItem[] = [],
  ): DisplayItem[] {
    const { search, customFilter } = props.value;
    const lowerSearch = search ? search.toLowerCase() : "";

    for (const item of itemsList) {
      const id = item[actualItemProps.value.value];
      const children = item[actualItemProps.value.children] as TreeItem[] | undefined;
      const hasChildren = Boolean(children && children.length > 0);

      const isOpen = openedSet.value.has(id);
      const isActive = activeSet.value.has(id);

      if (lowerSearch) {
        const matches = customFilter
          ? customFilter(id, search as string, { raw: item })
          : String(item[actualItemProps.value.title] ?? "")
              .toLowerCase()
              .includes(lowerSearch) || String(id).toLowerCase().includes(lowerSearch);

        if (hasChildren) {
          const subtree: DisplayItem[] = [];
          flattenTree(children ?? [], depth + 1, subtree);
          if (subtree.length === 0 && !matches) {
            continue;
          }

          result.push({
            raw: item,
            id,
            depth,
            isOpen,
            isActive,
            isLeaf: false,
          });
          if (isOpen) {
            result.push(...subtree);
          }
          continue;
        }
        if (!matches) {
          continue;
        }
      }

      result.push({
        raw: item,
        id,
        depth,
        isOpen,
        isActive,
        isLeaf: !hasChildren,
      });

      if (isOpen && hasChildren) {
        flattenTree(children ?? [], depth + 1, result);
      }
    }
    return result;
  }

  function traverse(itemsList: TreeItem[], allIds: unknown[]): void {
    for (const item of itemsList) {
      const children = item[actualItemProps.value.children] as TreeItem[] | undefined;
      if (children && children.length > 0) {
        allIds.push(item[actualItemProps.value.value]);
        traverse(children, allIds);
      }
    }
  }

  const displayItems = computed(() => flattenTree(props.value.items || []));

  watch(
    () => props.value.search,
    (newSearch, oldSearch) => {
      if (newSearch && !oldSearch) {
        const allIds: unknown[] = [];
        traverse(props.value.items || [], allIds);
        emit("update:opened", [...new Set([...(props.value.opened || []), ...allIds])]);
      }
    },
  );

  return {
    actualItemProps,
    actualSelection,
    displayItems,
    toggleOpen,
    toggleSelect,
    isSelected,
    getIndeterminate,
  };
}
