import type { ComputedRef, Ref } from "vue";

// Same shape as Vue's MaybeRefOrGetter<T>, kept as a local alias for readability at call sites.
type ReadonlyMaybeRefOrGetter<Value> = Value | Ref<Value> | (() => Value);

type TreeItem = Record<string, unknown>;

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
  readonly itemProps?: Partial<ItemPropsConfig>;
  readonly selection?: Partial<SelectionConfig>;
  readonly search?: string;
  readonly customFilter?: (id: unknown, search: string, context: { raw: TreeItem }) => boolean;
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

export { isTreeItemArray, toDisplayString };
export type {
  DisplayItem,
  EmitFn,
  ItemPropsConfig,
  ReadonlyMaybeRefOrGetter,
  SelectionConfig,
  TreeItem,
  UseVirtualTreeReturn,
  VirtualTreeProps,
};
