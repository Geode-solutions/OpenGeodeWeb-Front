import {
  type PhysicalPropertiesGroup,
  physicalPropertiesGroup,
} from "@ogw_front/utils/physical_properties_tree";
import type { ModelId } from "@ogw_front/types/identifiers";
import { useDataStore } from "@ogw_front/stores/data";

// The physical properties group of the model tree, from the database: stored at the model import
export function useModelPhysicalProperties(
  modelId: ModelId,
): ComputedRef<PhysicalPropertiesGroup | undefined> {
  const dataStore = useDataStore();
  const physicalProperties = dataStore.refPhysicalProperties(modelId);
  const meshGroups = dataStore.refFormatedMeshComponents(modelId);

  return computed(() => {
    if (!physicalProperties.value || !meshGroups.value) {
      return undefined;
    }
    const components = meshGroups.value.flatMap((group) => group.children);
    return physicalPropertiesGroup(physicalProperties.value, components);
  });
}
