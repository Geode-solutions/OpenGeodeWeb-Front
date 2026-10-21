import {
  type AttributeColoring,
  type AttributeColoringStyle,
  attributeSchemas,
  attributeType,
  storeMethod,
  useAttributeColoringStyle,
} from "@ogw_front/composables/attribute_coloring_style";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";

// Components of the same type colored by the same attribute share the store methods, e.g. "modelBlocksPolyhedronAttributeName"
interface ComponentGroup {
  // Component type of the store methods, e.g. "Block"
  type: string;
  activeColoring: string;
  componentIds: string[];
}

function modelColoring(
  dataStyleStore: object,
  modelId: string,
  { type, activeColoring, componentIds }: ComponentGroup,
): AttributeColoring {
  const methodName = `${type}s${attributeType(activeColoring)}`;
  return {
    // Every component of the coloring shares its style: reading the first one is enough
    read: (property): unknown =>
      storeMethod(dataStyleStore, `model${methodName}${property}`)(modelId, componentIds[0]),
    write: async (property, ...values): Promise<void> => {
      await storeMethod(dataStyleStore, `setModel${methodName}${property}`)(
        modelId,
        componentIds,
        ...values,
      );
    },
    schemas: attributeSchemas("model_component_", activeColoring),
    params: { id: modelId, component_ids: componentIds },
  };
}

// Styles the model components colored by the picked scalar bar
export function useModelAttributeStyle(
  modelIdRef: Ref<string>,
  blockViewerIdsRef: Ref<number[]>,
): AttributeColoringStyle {
  const dataStyleStore = useDataStyleStore();
  const dataStore = useDataStore();

  const colorings = shallowRef<AttributeColoring[]>([]);
  const style = useAttributeColoringStyle(colorings);

  async function loadColorings(): Promise<void> {
    const modelId = modelIdRef.value;
    const blockViewerIds = blockViewerIdsRef.value;
    const components = await dataStore.getComponentsByViewerIds(modelId, blockViewerIds);
    // A newer pick replaced this one while the components were read
    if (modelId !== modelIdRef.value || blockViewerIds !== blockViewerIdsRef.value) {
      return;
    }
    const groups = new Map<string, ComponentGroup>();
    for (const { type, geode_id } of components) {
      const activeColoring = String(
        storeMethod(dataStyleStore, `model${type}ActiveColoring`)(modelId, geode_id),
      );
      const key = `${type}_${activeColoring}`;
      const group = groups.get(key) ?? { type, activeColoring, componentIds: [] };
      group.componentIds.push(geode_id);
      groups.set(key, group);
    }
    colorings.value = [...groups.values()].map((group) =>
      modelColoring(dataStyleStore, modelId, group),
    );
    await style.loadTimeSteps();
  }

  watch([modelIdRef, blockViewerIdsRef], loadColorings, { immediate: true });
  return style;
}
