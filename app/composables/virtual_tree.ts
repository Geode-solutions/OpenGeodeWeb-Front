import type { Ref } from "vue";

// Like Vue's MaybeRefOrGetter<T>, but the Ref branch is narrowed to Readonly<Ref<T>>: a plain
// Ref<T> always fails prefer-readonly-parameter-types (its `.value` is writable) no matter how
// Deeply readonly T itself is, and wrapping the *whole* union in Readonly<> instead would collapse
// The getter-function branch to an uncallable `{}` (Readonly<Fn> has no keys). Callers passing an
// Ordinary Ref<T> still type-check fine here: a mutable Ref<T> is assignable to Readonly<Ref<T>>.
type ReadonlyMaybeRefOrGetter<Value> = Value | Readonly<Ref<Value>> | (() => Value);

type TreeItem = Readonly<Record<string, unknown>>;

interface ItemPropsConfig {
  value: string;
  title: string;
  children: string;
  height: number;
  [key: string]: unknown;
}

interface SelectionConfig {
  selectable: boolean;
  strategy: string;
  [key: string]: unknown;
}

interface VirtualTreeProps {
  readonly items?: readonly TreeItem[];
  readonly opened?: readonly unknown[];
  readonly selected?: readonly unknown[];
  readonly active?: readonly unknown[];
  readonly itemProps?: Readonly<Partial<ItemPropsConfig>>;
  readonly selection?: Readonly<Partial<SelectionConfig>>;
  readonly search?: string;
  readonly customFilter?: (
    id: unknown,
    search: string,
    context: Readonly<{ raw: TreeItem }>,
  ) => boolean;
}

interface DisplayItem {
  raw: TreeItem;
  id: unknown;
  depth: number;
  isOpen: boolean;
  isActive: boolean;
  isLeaf: boolean;
}

type EmitFn = (event: string, ...args: readonly unknown[]) => void;

interface UseVirtualTreeReturn {
  actualItemProps: ComputedRef<ItemPropsConfig>;
  actualSelection: ComputedRef<SelectionConfig>;
  displayItems: ComputedRef<DisplayItem[]>;
  toggleOpen: (item: TreeItem) => void;
  toggleSelect: (item: TreeItem) => void;
  isSelected: (item: TreeItem) => boolean;
  getIndeterminate: (item: TreeItem) => boolean;
}

// Real runtime check (rather than an `as TreeItem[]` cast) for the duck-typed "children" field:
// Item shapes vary across callers (treeview groups, model component/collection groups, ...), so
// This only verifies it is actually an array, same as the assumption the old cast silently made.
function isTreeItemArray(value: unknown): value is TreeItem[] {
  return Array.isArray(value);
}

// Extracted so we never call String() directly on a value typed as `unknown` (ids and titles can
// Be anything at runtime): only stringify primitives that have a sane toString, and fall back to
// "" for anything else instead of risking "[object Object]".
function toDisplayString(value: unknown): string {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
}

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

  function flattenTree(itemsList: readonly TreeItem[], depth = 0): DisplayItem[] {
    const { search, customFilter } = props.value;
    const result: DisplayItem[] = [];

    for (const item of itemsList) {
      const id = item[actualItemProps.value.value];
      const children = getChildrenOf(item);
      const hasChildren = Boolean(children && children.length > 0);

      const isOpen = openedSet.value.has(id);
      const isActive = activeSet.value.has(id);

      if (search !== undefined && search !== "") {
        const lowerSearch = search.toLowerCase();
        const matches = customFilter
          ? customFilter(id, search, { raw: item })
          : toDisplayString(item[actualItemProps.value.title])
              .toLowerCase()
              .includes(lowerSearch) || toDisplayString(id).toLowerCase().includes(lowerSearch);

        if (hasChildren) {
          const subtree = flattenTree(children ?? [], depth + 1);
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
        result.push(...flattenTree(children ?? [], depth + 1));
      }
    }
    return result;
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

  const displayItems = computed(() => flattenTree(props.value.items ?? []));

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

export { useVirtualTree };
export type { TreeItem, ItemPropsConfig, SelectionConfig, DisplayItem, EmitFn };
