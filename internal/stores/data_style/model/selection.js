import { MESH_COMPONENT_TYPES } from "@ogw_front/utils/default_styles";
import { database } from "@ogw_internal/database/database";

function buildSelection(
  modelId,
  components,
  componentStyles,
  modelComponentTypeStyles,
  dataStyleState,
) {
  const componentsByType = Object.fromEntries(
    MESH_COMPONENT_TYPES.map((componentType) => [componentType, []]),
  );
  for (const component of components) {
    if (componentsByType[component.type]) {
      componentsByType[component.type].push(component);
    }
  }

  const groupStyles = dataStyleState.getStyle(modelId);
  const selection = [];
  for (const componentType of MESH_COMPONENT_TYPES) {
    const typeComponents = componentsByType[componentType];
    if (typeComponents.length === 0) {
      continue;
    }

    const typeKey = `${componentType.toLowerCase()}s`;
    const typeStyleKey = `${modelId}_${componentType}`;
    const typeStyle = modelComponentTypeStyles.value[typeStyleKey];
    const defaultVisibility = typeStyle?.visibility ?? groupStyles[typeKey]?.visibility ?? true;

    let allVisible = true;
    for (const component of typeComponents) {
      const styleKey = `${modelId}_${component.geode_id}`;
      const isVisible = componentStyles.value[styleKey]?.visibility ?? defaultVisibility;
      if (isVisible) {
        selection.push(component.geode_id);
      } else {
        allVisible = false;
      }
    }
    if (allVisible) {
      selection.push(componentType);
    }
  }
  return selection;
}

const selectionCache = new Map();

function useModelSelection(modelId, dataStyleState) {
  if (!modelId) {
    return computed(() => []);
  }

  const cacheKey = `${modelId}`;
  if (selectionCache.has(cacheKey)) {
    return selectionCache.get(cacheKey);
  }

  const allComponents = ref([]);

  (async () => {
    try {
      allComponents.value = await database.model_components.where("id").equals(modelId).toArray();
    } catch (error) {
      console.error("Error fetching model components:", error);
    }
  })();

  const computedSelection = computed(() => {
    if (allComponents.value.length === 0) {
      return [];
    }
    return buildSelection(
      modelId,
      allComponents.value,
      dataStyleState.componentStyles,
      dataStyleState.modelComponentTypeStyles,
      dataStyleState,
    );
  });

  selectionCache.set(cacheKey, computedSelection);
  return computedSelection;
}

export { buildSelection, useModelSelection };
