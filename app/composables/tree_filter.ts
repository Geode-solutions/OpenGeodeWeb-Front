import type { Ref } from "vue";

// Like Vue's MaybeRefOrGetter<T>, but the Ref branch is narrowed to Readonly<Ref<T>>: a plain
// Ref<T> always fails prefer-readonly-parameter-types (its `.value` is writable) no matter how
// Deeply readonly T itself is, and wrapping the *whole* union in Readonly<> instead would collapse
// The getter-function branch to an uncallable `{}` (Readonly<Fn> has no keys). Callers passing an
// Ordinary Ref<T> still type-check fine here: a mutable Ref<T> is assignable to Readonly<Ref<T>>.
type ReadonlyMaybeRefOrGetter<Value> = Value | Readonly<Ref<Value>> | (() => Value);

// This composable filters/sorts different flavors of "category with children" trees (treeview groups, model component/collection groups, ...); this shape captures just the fields it reads/writes, generically, across all of them.
interface FilterableItem {
  readonly id: unknown;
  readonly title?: string;
  readonly children?: readonly FilterableItem[];
}

interface FilterContext {
  readonly raw?: FilterableItem;
}

interface TreeFilterOptions {
  readonly recursiveSort?: boolean;
  readonly defaultSort?: string;
  readonly defaultFilters?: Readonly<Record<string, boolean>>;
}

interface UseTreeFilterReturn {
  search: Ref<string>;
  sortType: Ref<string>;
  filterOptions: Ref<Record<string, boolean>>;
  processedItems: ComputedRef<FilterableItem[]>;
  availableFilterOptions: ComputedRef<string[]>;
  toggleSort: () => void;
  customFilter: typeof customFilter;
  applySearchFilter: (
    newSelection: readonly unknown[],
    previousSelection?: readonly unknown[],
  ) => unknown[];
}

function customFilter(
  value: unknown,
  searchQuery: string | undefined,
  item: FilterContext,
): boolean {
  if (searchQuery === undefined || searchQuery === "") {
    return true;
  }
  if (!item.raw) {
    return false;
  }
  const query = searchQuery.toLowerCase();
  const { title = "", id = value } = item.raw;
  return [title, id].some((field) => String(field).toLowerCase().includes(query));
}

// Extracted so we never call String() directly on a value typed as `unknown`/`any`.
// The `id` field can be anything at runtime, so only stringify primitives that have a sane toString.
// Anything else falls back to "" instead of risking "[object Object]".
function toSortKey(item: FilterableItem, field: "title" | "id"): string {
  const raw = item[field] ?? item.id ?? "";
  if (typeof raw === "string" || typeof raw === "number" || typeof raw === "boolean") {
    return String(raw);
  }
  return "";
}

function sortAndFormatItems(
  itemList: readonly FilterableItem[] | undefined | null,
  sortType: string,
  options: TreeFilterOptions = {},
): FilterableItem[] {
  if (!itemList) {
    return [];
  }
  const field: "title" | "id" = sortType === "name" ? "title" : "id";
  const localeOptions: Intl.CollatorOptions = { numeric: true, sensitivity: "base" };

  // Copy into a plain mutable array up front: chaining .filter()/.toSorted() straight off the
  // Readonly-typed parameter (previously combined with an Array.isArray guard here) has been
  // Observed to make oxlint's type-aware analysis silently widen the result to `any[]`.
  const items: FilterableItem[] = [...itemList];
  const sorted = items
    .filter((item) => item !== null && item !== undefined)
    .toSorted((itemA, itemB) =>
      toSortKey(itemA, field).localeCompare(toSortKey(itemB, field), undefined, localeOptions),
    );

  if (options.recursiveSort === true) {
    return sorted.map((item) => {
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: sortAndFormatItems(item.children, sortType, options),
        };
      }
      return item;
    });
  }
  return sorted;
}

function useTreeFilter(
  itemsIn: ReadonlyMaybeRefOrGetter<readonly FilterableItem[]>,
  options: TreeFilterOptions = {},
): UseTreeFilterReturn {
  const rawItems = typeof itemsIn === "function" ? computed(itemsIn) : toRef(itemsIn);
  const search = ref("");
  const sortType = ref(options.defaultSort ?? "name");
  const filterOptions = ref<Record<string, boolean>>({ ...options.defaultFilters });

  const availableFilterOptions = computed(() =>
    rawItems.value.map((category) => String(category.title ?? category.id)),
  );

  watch(
    availableFilterOptions,
    (newOptions: readonly string[]) => {
      for (const option of newOptions) {
        filterOptions.value[option] ??= true;
      }
    },
    { immediate: true },
  );

  const processedItems = computed(() => {
    const filteredByCategory = rawItems.value.filter((category) => {
      const key = String(category.title ?? category.id);
      return filterOptions.value[key] !== false;
    });

    const sorted = sortAndFormatItems(filteredByCategory, sortType.value, options);

    if (!search.value) {
      return sorted;
    }

    const result: FilterableItem[] = [];
    for (const category of sorted) {
      const children = (category.children ?? []).filter((child) =>
        customFilter(child.id, search.value, { raw: child }),
      );
      if (children.length > 0 || customFilter(category.id, search.value, { raw: category })) {
        result.push({ ...category, children });
      }
    }
    return result;
  });

  function toggleSort(): void {
    sortType.value = sortType.value === "name" ? "id" : "name";
  }

  const allItems = computed(() => {
    const map = new Map<unknown, FilterableItem>();
    function traverse(items: readonly FilterableItem[]): void {
      for (const item of items) {
        map.set(item.id, item);
        if (item.children) {
          traverse(item.children);
        }
      }
    }
    traverse(rawItems.value);
    return map;
  });

  function applySearchFilter(
    newSelection: readonly unknown[],
    previousSelection: readonly unknown[] = [],
  ): unknown[] {
    if (!search.value) {
      return [...newSelection];
    }
    const allItemsMap = allItems.value;
    function matches(id: unknown): boolean {
      const item = allItemsMap.get(id);
      return Boolean(item && customFilter(id, search.value, { raw: item }));
    }
    const hidden = previousSelection.filter((id) => !matches(id));
    const visible = newSelection.filter((id) => matches(id));
    return [...new Set([...hidden, ...visible])];
  }

  return {
    search,
    sortType,
    filterOptions,
    processedItems,
    availableFilterOptions,
    toggleSort,
    customFilter,
    applySearchFilter,
  };
}

export { customFilter, useTreeFilter, sortAndFormatItems };
export type { FilterableItem };
