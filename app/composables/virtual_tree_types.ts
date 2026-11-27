import type { ComputedRef, Ref } from "vue";
import type { Pixels, SearchQuery } from "@ogw_front/types/ui";

// Same shape as Vue's MaybeRefOrGetter<T>, kept as a local alias for readability at call sites.
type ReadonlyMaybeRefOrGetter<Value> = Value | Ref<Value> | (() => Value);

type TreeItem = Record<string, unknown>;

// The name of the field of a tree item that holds one of its properties (value, title, children...)
type ItemPropName = string;

interface ItemPropsConfig {
  value: ItemPropName;
  title: ItemPropName;
  children: ItemPropName;
  // Sub-tree shown under an item without making it a branch: it stays a leaf for selection and clicks
  details: ItemPropName;
  height: Pixels;
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
  readonly itemProps?: Partial<ItemPropsConfig>;
  readonly selection?: Partial<SelectionConfig>;
  readonly search?: SearchQuery;
  readonly customFilter?: (id: unknown, search: SearchQuery, context: { raw: TreeItem }) => boolean;
}

// How deep a row sits in the virtual tree, 0 for the top level rows
type TreeDepth = number;

interface DisplayItem {
  raw: TreeItem;
  id: unknown;
  depth: TreeDepth;
  isOpen: boolean;
  isActive: boolean;
  isLeaf: boolean;
  // A leaf can still be expanded when it carries details
  isExpandable: boolean;
}

// A row of the flattened tree, as the scroll and keyboard navigation read it
type ReadonlyDisplayItem = Omit<DisplayItem, "raw"> & {
  readonly raw: Record<string, unknown>;
};

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

export { isTreeItemArray, toDisplayString };
export type {
  DisplayItem,
  EmitFn,
  ItemPropName,
  ItemPropsConfig,
  ReadonlyDisplayItem,
  ReadonlyMaybeRefOrGetter,
  SelectionConfig,
  TreeDepth,
  TreeItem,
  UseVirtualTreeReturn,
  VirtualTreeProps,
};
