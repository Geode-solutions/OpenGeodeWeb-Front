import { MESH_TYPES } from "@ogw_front/utils/default_styles";
import { database } from "@ogw_internal/database/database";

function buildSelection(
  modelId,
  components,
  componentStyles,
  modelComponentTypeStyles,
  dataStyleState,
) {
  const componentsByType = Object.fromEntries(
    MESH_TYPES.map((componentType) => [componentType, []]),
  );
  for (const component of components) {
    if (componentsByType[component.type]) {
      componentsByType[component.type].push(component);
    }
  }

  const groupStyles = dataStyleState.styles.value[modelId] || {};
  const selection = [];
  for (const componentType of MESH_TYPES) {
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

function useModelSelection(modelId, dataStyleState) {
  const allComponents = ref([]);

  if (modelId) {
    (async () => {
      try {
        allComponents.value = await database.model_components.where("id").equals(modelId).toArray();
      } catch (error) {
        console.error("Error fetching model components:", error);
      }
    })();
  }

  return computed(() => {
    if (!modelId || allComponents.value.length === 0) {
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
}

export { buildSelection, useModelSelection };
