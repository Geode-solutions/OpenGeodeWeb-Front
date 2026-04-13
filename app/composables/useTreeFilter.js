import { ref, computed, watch } from "vue";

export function useTreeFilter(rawItems, options = {}) {
  const search = ref("");
  const sortType = ref(options.defaultSort || "name");
  const filterOptions = ref(options.defaultFilters || {});

  const availableFilterOptions = computed(() =>
    rawItems.value.map((category) => category.title || category.id),
  );

  // Initialize filter options if they don't exist
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
    return rawItems.value
      .filter((category) => {
        const key = category.title || category.id;
        return filterOptions.value[key] !== false;
      })
      .map((category) => {
        const field = sortType.value === "name" ? "title" : "id";
        const children = (category.children || []).toSorted((first, second) => {
          const val1 = first[field] || "";
          const val2 = second[field] || "";
          return val1.localeCompare(val2, undefined, {
            numeric: true,
            sensitivity: "base",
          });
        });
        return {
          ...category,
          title: category.title || category.id,
          children,
        };
      });
  });

  function toggleSort() {
    sortType.value = sortType.value === "name" ? "id" : "name";
  }

  function customFilter(_value, searchQuery, item) {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const title = (item.raw.title || "").toLowerCase();
    const id = (item.raw.id || "").toLowerCase();
    return title.includes(query) || id.includes(query);
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
