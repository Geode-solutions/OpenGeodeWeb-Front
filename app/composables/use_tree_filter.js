function customFilter(value, searchQuery, item) {
  if (!searchQuery) {
    return true;
  }
  const query = searchQuery.toLowerCase();
  const title = (item.raw.title || "").toLowerCase();
  const idValue = String(value || "").toLowerCase();
  return title.includes(query) || idValue.includes(query);
}

function sortAndFormatItems(items, sortType) {
  const field = sortType === "name" ? "title" : "id";
  return items.map((category) => {
    const children = (category.children || []).toSorted((itemA, itemB) => {
      const valueA = itemA[field] || "";
      const valueB = itemB[field] || "";
      return valueA.localeCompare(valueB, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });
    return {
      ...category,
      children,
    };
  });
}

function useTreeFilter(rawItems, options = {}) {
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
    const sorted = sortAndFormatItems(
      rawItems.value.filter((category) => {
        const key = category.title || category.id;
        return filterOptions.value[key] !== false;
      }),
      sortType.value,
    );
    if (!search.value) {
      return sorted;
    }
    return sorted
      .map((category) => {
        category.children = (category.children || []).filter((child) =>
          customFilter(child.id, search.value, { raw: child }),
        );
        return category;
      })
      .filter((category) => category.children.length > 0);
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

  function applySearchFilter(newSelection) {
    if (!search.value) {
      return newSelection;
    }
    const allItemsMap = allItems.value;
    return newSelection.filter((id) => {
      const item = allItemsMap.get(id);
      return item && customFilter(id, search.value, { raw: item });
    });
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

export { customFilter, useTreeFilter };
