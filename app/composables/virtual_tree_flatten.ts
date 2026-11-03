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

function flattenTree(ctx: FlattenContext, nodes: readonly TreeItem[], depth = 0): DisplayItem[] {
  const { search, customFilter } = ctx.props.value;
  const result: DisplayItem[] = [];

  for (const item of nodes) {
    const id = item[ctx.actualItemProps.value.value];
    const children = ctx.getChildrenOf(item);
    const hasChildren = Boolean(children && children.length > 0);

    const isOpen = ctx.openedSet.value.has(id);
    const isActive = ctx.activeSet.value.has(id);

    if (search !== undefined && search !== "") {
      const lowerSearch = search.toLowerCase();
      const matches = customFilter
        ? customFilter(id, search, { raw: item })
        : toDisplayString(item[ctx.actualItemProps.value.title])
            .toLowerCase()
            .includes(lowerSearch) || toDisplayString(id).toLowerCase().includes(lowerSearch);

      if (hasChildren) {
        const subtree = flattenTree(ctx, children ?? [], depth + 1);
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
      result.push(...flattenTree(ctx, children ?? [], depth + 1));
    }
  }
  return result;
}

export { flattenTree };
export type { FlattenContext };
