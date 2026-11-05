import type { ComputedRef, Ref } from "vue";
import {
  type DisplayItem,
  type ItemPropsConfig,
  type TreeItem,
  type VirtualTreeProps,
  toDisplayString,
} from "./virtual_tree_types";

interface FlattenContext {
  props: Ref<VirtualTreeProps>;
  actualItemProps: ComputedRef<ItemPropsConfig>;
  openedSet: ComputedRef<Set<unknown>>;
  activeSet: ComputedRef<Set<unknown>>;
  getChildrenOf: (item: TreeItem) => TreeItem[] | undefined;
}

function matchesSearch(ctx: FlattenContext, item: TreeItem, id: unknown, search: string): boolean {
  const { customFilter } = ctx.props.value;
  if (customFilter) {
    return customFilter(id, search, { raw: item });
  }
  const lowerSearch = search.toLowerCase();
  return (
    toDisplayString(item[ctx.actualItemProps.value.title]).toLowerCase().includes(lowerSearch) ||
    toDisplayString(id).toLowerCase().includes(lowerSearch)
  );
}

function createDisplayItem(ctx: FlattenContext, item: TreeItem, depth: number): DisplayItem {
  const id = item[ctx.actualItemProps.value.value];
  return {
    raw: item,
    id,
    depth,
    isOpen: ctx.openedSet.value.has(id),
    isActive: ctx.activeSet.value.has(id),
    isLeaf: true,
  };
}

type FlattenChildren = (children: readonly TreeItem[]) => DisplayItem[];

// A branch is kept when it matches or when one of its descendants does
function flattenSearchedBranch(
  entry: DisplayItem,
  subtree: readonly DisplayItem[],
  matches: boolean,
): DisplayItem[] {
  if (subtree.length === 0 && !matches) {
    return [];
  }
  const branch = { ...entry, isLeaf: false };
  if (!branch.isOpen) {
    return [branch];
  }
  return [branch, ...subtree];
}

function flattenOpenBranch(
  entry: DisplayItem,
  children: readonly TreeItem[],
  flattenChildren: FlattenChildren,
): DisplayItem[] {
  const branch = { ...entry, isLeaf: false };
  if (!branch.isOpen) {
    return [branch];
  }
  return [branch, ...flattenChildren(children)];
}

function flattenNode(
  ctx: FlattenContext,
  item: TreeItem,
  depth: number,
  flattenChildren: FlattenChildren,
): DisplayItem[] {
  const { search } = ctx.props.value;
  const entry = createDisplayItem(ctx, item, depth);
  const children = ctx.getChildrenOf(item) ?? [];
  const searching = search !== undefined && search !== "";

  if (children.length === 0) {
    if (searching && !matchesSearch(ctx, item, entry.id, search)) {
      return [];
    }
    return [entry];
  }
  if (searching) {
    const matches = matchesSearch(ctx, item, entry.id, search);
    return flattenSearchedBranch(entry, flattenChildren(children), matches);
  }
  return flattenOpenBranch(entry, children, flattenChildren);
}

function flattenTree(ctx: FlattenContext, nodes: readonly TreeItem[], depth = 0): DisplayItem[] {
  const result: DisplayItem[] = [];
  function flattenChildren(children: readonly TreeItem[]): DisplayItem[] {
    return flattenTree(ctx, children, depth + 1);
  }

  for (const item of nodes) {
    result.push(...flattenNode(ctx, item, depth, flattenChildren));
  }
  return result;
}

export { flattenTree };
export type { FlattenContext };
