import {
  type PhysicalPropertiesGroup,
  physicalPropertiesGroup,
  searchPhysicalProperties,
} from "@ogw_front/utils/physical_properties_tree";
import type { ModelId } from "@ogw_front/types/identifiers";
import { useDataStore } from "@ogw_front/stores/data";

// The physical properties group of the model tree, from the database: stored at the model import.
// Its rows are the group itself, or what a search shows of it
export function useModelPhysicalProperties(
  modelId: ModelId,
  search: Ref<string>,
): {
  physicalProperties: ComputedRef<PhysicalPropertiesGroup | undefined>;
  physicalPropertyRows: ComputedRef<PhysicalPropertiesGroup[]>;
} {
  const dataStore = useDataStore();
  const storedPhysicalProperties = dataStore.refPhysicalProperties(modelId);
  const meshGroups = dataStore.refFormatedMeshComponents(modelId);

  const physicalProperties = computed(() => {
    if (!storedPhysicalProperties.value || !meshGroups.value) {
      return undefined;
    }
    const components = meshGroups.value.flatMap((group) => group.children);
    return physicalPropertiesGroup(storedPhysicalProperties.value, components);
  });

  const physicalPropertyRows = computed(() => {
    if (search.value) {
      return searchPhysicalProperties(physicalProperties.value, search.value.toLowerCase());
    }
    if (physicalProperties.value === undefined) {
      return [];
    }
    return [physicalProperties.value];
  });

  return { physicalProperties, physicalPropertyRows };
}
