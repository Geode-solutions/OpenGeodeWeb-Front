import {
  type PhysicalPropertyNode,
  physicalPropertyNodes,
  physicalPropertyTitle,
  searchPhysicalProperties,
  sortPhysicalPropertyLeaves,
} from "@ogw_front/utils/physical_properties_tree";
import type { ModelId } from "@ogw_front/types/identifiers";
import { useDataStore } from "@ogw_front/stores/data";

// The physical properties tree of a model, from the database (stored at the model import): its
// Properties, and the rows shown once filtered by property, sorted and searched
export function useModelPhysicalProperties(modelId: ModelId): {
  physicalProperties: ComputedRef<PhysicalPropertyNode[]>;
  rows: ComputedRef<PhysicalPropertyNode[]>;
  search: Ref<string>;
  sortType: Ref<string>;
  toggleSort: () => void;
  filterOptions: Ref<Record<string, boolean>>;
  availableFilterOptions: ComputedRef<string[]>;
} {
  const dataStore = useDataStore();
  const storedPhysicalProperties = dataStore.refPhysicalProperties(modelId);
  const meshGroups = dataStore.refFormatedMeshComponents(modelId);
  const search = ref("");
  const sortType = ref("name");
  const filterOptions = ref<Record<string, boolean>>({});

  const physicalProperties = computed(() => {
    if (!storedPhysicalProperties.value || !meshGroups.value) {
      return [];
    }
    const components = meshGroups.value.flatMap((group) => group.children);
    return physicalPropertyNodes(storedPhysicalProperties.value, components);
  });

  // One filter per property, by its name
  const availableFilterOptions = computed(() =>
    physicalProperties.value.map((node) => physicalPropertyTitle(node.physical_property)),
  );
  watch(
    availableFilterOptions,
    (options) => {
      for (const option of options) {
        filterOptions.value[option] ??= true;
      }
    },
    { immediate: true },
  );

  // The components of each property, by name or by id
  const rows = computed(() => {
    const shown: PhysicalPropertyNode[] = [];
    for (const node of physicalProperties.value) {
      if (filterOptions.value[physicalPropertyTitle(node.physical_property)] !== false) {
        shown.push({
          ...node,
          children: sortPhysicalPropertyLeaves(node.children, sortType.value),
        });
      }
    }
    if (!search.value) {
      return shown;
    }
    return searchPhysicalProperties(shown, search.value.toLowerCase());
  });

  function toggleSort(): void {
    sortType.value = sortType.value === "name" ? "id" : "name";
  }

  return {
    physicalProperties,
    rows,
    search,
    sortType,
    toggleSort,
    filterOptions,
    availableFilterOptions,
  };
}
