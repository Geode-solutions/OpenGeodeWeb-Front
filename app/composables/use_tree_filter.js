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
    return sortAndFormatItems(
      rawItems.value.filter((category) => {
        const key = category.title || category.id;
        return filterOptions.value[key] !== false;
      }),
      sortType.value,
    );
  });

  function toggleSort() {
    sortType.value = sortType.value === "name" ? "id" : "name";
  }

  return {
    search,
    sortType,
    filterOptions,
    processedItems,
    availableFilterOptions,
    toggleSort,
    customFilter,
  };
}

export { customFilter, useTreeFilter };
