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
      id: category.id,
      title: category.title || category.id,
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
    const filteredByType = rawItems.value.filter((category) => {
      const key = category.title || category.id;
      return filterOptions.value[key] !== false;
    });

    const query = search.value.toLowerCase();
    const filteredBySearch = filteredByType
      .map((category) => {
        const children = (category.children || []).filter((item) => {
          if (!query) {
            return true;
          }
          const title = (item.title || "").toLowerCase();
          const idValue = String(item.id || "").toLowerCase();
          return title.includes(query) || idValue.includes(query);
        });
        return { ...category, children };
      })
      .filter((category) => category.children.length > 0);

    return sortAndFormatItems(filteredBySearch, sortType.value);
  });

  const filteredIds = computed(() => {
    const ids = new Set();
    const traverse = (items) => {
      for (const item of items) {
        ids.add(item.id);
        if (item.children) {
          traverse(item.children);
        }
      }
    };
    traverse(processedItems.value);
    return ids;
  });

  function toggleSort() {
    sortType.value = sortType.value === "name" ? "id" : "name";
  }

  return {
    search,
    sortType,
    filterOptions,
    processedItems,
    filteredIds,
    availableFilterOptions,
    toggleSort,
    customFilter,
  };
}

export { customFilter, useTreeFilter };
