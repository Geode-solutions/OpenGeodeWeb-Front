function customFilter(value, searchQuery, item) {
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

function sortAndFormatItems(itemList, sortType, options = {}) {
  if (!itemList || !Array.isArray(itemList)) {
    return [];
  }
  const field = sortType === "name" ? "title" : "id";
  const localeOptions = { numeric: true, sensitivity: "base" };

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

function useTreeFilter(itemsIn, options = {}) {
  const rawItems = typeof itemsIn === "function" ? computed(itemsIn) : toRef(itemsIn);
  const search = ref("");
  const sortType = ref(options.defaultSort || "name");
  const filterOptions = ref(options.defaultFilters || {});

  const availableFilterOptions = computed(() => {
    if (!rawItems.value) {
      return [];
    }
    return rawItems.value.map((category) => category.title || category.id);
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
      const key = category.title || category.id;
      return filterOptions.value[key] !== false;
    });

    const sorted = sortAndFormatItems(filteredByCategory, sortType.value, options);

    if (!search.value) {
      return sorted;
    }

    const result = [];
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

  function toggleSort() {
    sortType.value = sortType.value === "name" ? "id" : "name";
  }

  const allItems = computed(() => {
    const map = new Map();
    function traverse(items) {
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

  function applySearchFilter(newSelection, previousSelection = []) {
    if (!search.value) {
      return newSelection;
    }
    const allItemsMap = allItems.value;
    function matches(id) {
      const item = allItemsMap.get(id);
      return item && customFilter(id, search.value, { raw: item });
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
