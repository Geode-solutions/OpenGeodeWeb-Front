import type { MaybeRefOrGetter } from "vue";

// This composable filters/sorts different flavors of "category with children" trees (treeview groups, model component/collection groups, ...); this shape captures just the fields it reads/writes, generically, across all of them.
export interface FilterableItem {
  id: unknown;
  title?: string;
  children?: FilterableItem[];
}

interface FilterContext {
  raw?: FilterableItem;
}

interface TreeFilterOptions {
  recursiveSort?: boolean;
  defaultSort?: string;
  defaultFilters?: Record<string, boolean>;
}

function customFilter(value: unknown, searchQuery: string | undefined, item: FilterContext): boolean {
  if (!searchQuery) {
    return true;
  }
  if (!item || !item.raw) {
    return false;
  }
  const query = searchQuery.toLowerCase();
  const { title = "", id = value } = item.raw || {};
  return [title, id].some((field) => String(field).toLowerCase().includes(query));
}

function sortAndFormatItems(
  itemList: FilterableItem[] | undefined | null,
  sortType: string,
  options: TreeFilterOptions = {},
): FilterableItem[] {
  if (!itemList || !Array.isArray(itemList)) {
    return [];
  }
  const field: "title" | "id" = sortType === "name" ? "title" : "id";
  const localeOptions: Intl.CollatorOptions = { numeric: true, sensitivity: "base" };

  const sorted = itemList
    .filter((item) => item !== null && item !== undefined)
    .toSorted((itemA, itemB) => {
      const fieldA = String(itemA[field] || itemA.id || "");
      const fieldB = String(itemB[field] || itemB.id || "");
      return fieldA.localeCompare(fieldB, undefined, localeOptions);
    });

  if (options.recursiveSort) {
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

function useTreeFilter(itemsIn: MaybeRefOrGetter<FilterableItem[]>, options: TreeFilterOptions = {}) {
  const rawItems = typeof itemsIn === "function" ? computed(itemsIn) : toRef(itemsIn);
  const search = ref("");
  const sortType = ref(options.defaultSort || "name");
  const filterOptions = ref<Record<string, boolean>>(options.defaultFilters || {});

  const availableFilterOptions = computed(() => {
    if (!rawItems.value) {
      return [];
    }
    return rawItems.value.map((category) => String(category.title || category.id));
  });

  watch(
    availableFilterOptions,
    (newOptions) => {
      for (const option of newOptions) {
        if (filterOptions.value[option] === undefined) {
          filterOptions.value[option] = true;
        }
      }
    },
    { immediate: true },
  );

  const processedItems = computed(() => {
    if (!rawItems.value) {
      return [];
    }
    const filteredByCategory = rawItems.value.filter((category) => {
      const key = String(category.title || category.id);
      return filterOptions.value[key] !== false;
    });

    const sorted = sortAndFormatItems(filteredByCategory, sortType.value, options);

    if (!search.value) {
      return sorted;
    }

    const result: FilterableItem[] = [];
    for (const category of sorted) {
      const children = (category.children || []).filter((child) =>
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
    function traverse(items: FilterableItem[]): void {
      for (const item of items) {
        map.set(item.id, item);
        if (item.children) {
          traverse(item.children);
        }
      }
    }
    traverse(rawItems.value || []);
    return map;
  });

  function applySearchFilter(newSelection: unknown[], previousSelection: unknown[] = []): unknown[] {
    if (!search.value) {
      return newSelection;
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
