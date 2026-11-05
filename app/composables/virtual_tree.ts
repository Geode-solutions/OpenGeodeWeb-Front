import {
  type EmitFn,
  type ItemPropsConfig,
  type ReadonlyMaybeRefOrGetter,
  type SelectionConfig,
  type TreeItem,
  type UseVirtualTreeReturn,
  type VirtualTreeProps,
  isTreeItemArray,
} from "./virtual_tree_types";
import { flattenTree } from "./virtual_tree_flatten";

function useVirtualTree(
  propsIn: ReadonlyMaybeRefOrGetter<VirtualTreeProps>,
  emit: EmitFn,
): UseVirtualTreeReturn {
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
  const activeSet = computed(() => new Set(props.value.active));

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

  function getChildrenOf(item: TreeItem): TreeItem[] | undefined {
    const rawChildren = item[actualItemProps.value.children];
    return isTreeItemArray(rawChildren) ? rawChildren : undefined;
  }

  function getLeafChildrenIds(item: TreeItem): unknown[] {
    const children = getChildrenOf(item);
    if (children) {
      return children.flatMap((child) => getLeafChildrenIds(child));
    }
    return [item[actualItemProps.value.value]];
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

  function collectNonLeafIds(itemsList: readonly TreeItem[]): unknown[] {
    const allIds: unknown[] = [];
    for (const item of itemsList) {
      const children = getChildrenOf(item);
      if (children && children.length > 0) {
        allIds.push(item[actualItemProps.value.value], ...collectNonLeafIds(children));
      }
    }
    return allIds;
  }

  const flattenContext = { props, actualItemProps, openedSet, activeSet, getChildrenOf };
  const displayItems = computed(() => flattenTree(flattenContext, props.value.items ?? []));

  watch(
    () => props.value.search,
    (newSearch, oldSearch) => {
      const hasNewSearch = newSearch !== undefined && newSearch !== "";
      const hadOldSearch = oldSearch !== undefined && oldSearch !== "";
      if (hasNewSearch && !hadOldSearch) {
        const allIds = collectNonLeafIds(props.value.items ?? []);
        emit("update:opened", [...new Set([...(props.value.opened ?? []), ...allIds])]);
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

export type {
  DisplayItem,
  EmitFn,
  ItemPropsConfig,
  SelectionConfig,
  TreeItem,
} from "./virtual_tree_types";
export { useVirtualTree };
