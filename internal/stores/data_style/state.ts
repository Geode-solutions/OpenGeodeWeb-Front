import { database } from "@ogw_internal/database/database";
import { liveQuery } from "dexie";
import merge from "lodash/merge";
import { useObservable } from "@vueuse/rxjs";

let sharedState = undefined;

function getSharedState() {
  if (sharedState) {
    return sharedState;
  }

  const dataStyleTable = database.data_style;
  const modelComponentDataStyleTable = database.model_component_datastyle;
  const modelComponentTypeDataStyleTable = database.model_component_type_datastyle;

  const styles = useObservable(
    liveQuery(async () => {
      const objectStyles = await dataStyleTable.toArray();
      const stylesByObjectId = {};
      for (const objectStyle of objectStyles) {
        stylesByObjectId[objectStyle.id] = objectStyle;
      }
      return stylesByObjectId;
    }),
    { initialValue: {} },
  );

  const modelComponentTypeStyles = ref({});
  const componentStyles = ref({});

  async function loadFromDatabase() {
    const [fetchedTypeStyles, fetchedComponentStyles] = await Promise.all([
      modelComponentTypeDataStyleTable.toArray(),
      modelComponentDataStyleTable.toArray(),
    ]);
    const typeStylesMap = {};
    for (const typeStyle of fetchedTypeStyles) {
      const cacheKey = `${typeStyle.id_model}_${typeStyle.type}`;
      typeStylesMap[cacheKey] = typeStyle;
    }
    modelComponentTypeStyles.value = typeStylesMap;

    const componentStylesMap = {};
    for (const componentStyle of fetchedComponentStyles) {
      const cacheKey = `${componentStyle.id_model}_${componentStyle.id_component}`;
      componentStylesMap[cacheKey] = componentStyle;
    }
    componentStyles.value = componentStylesMap;
  }

  loadFromDatabase();

  function updateComponentStyleCache(modelId, componentId, styleValues) {
    const cacheKey = `${modelId}_${componentId}`;
    const existingStyle = componentStyles.value[cacheKey];
    if (existingStyle) {
      merge(existingStyle, styleValues);
    } else {
      componentStyles.value[cacheKey] = merge(
        { id_model: modelId, id_component: componentId },
        styleValues,
      );
    }
  }

  function bulkUpdateComponentStyleCache(modelId, componentStyleUpdates) {
    const updatedComponentStyles = { ...componentStyles.value };
    for (const { id_component: componentId, values: styleValues } of componentStyleUpdates) {
      const cacheKey = `${modelId}_${componentId}`;
      const existingStyle = updatedComponentStyles[cacheKey];
      if (existingStyle) {
        updatedComponentStyles[cacheKey] = merge({}, existingStyle, styleValues);
      } else {
        updatedComponentStyles[cacheKey] = merge(
          { id_model: modelId, id_component: componentId },
          styleValues,
        );
      }
    }
    componentStyles.value = updatedComponentStyles;
  }

  function bulkUpdateComponentStylesCache(modelId, componentIds, styleValues) {
    const updatedComponentStyles = { ...componentStyles.value };
    for (const componentId of componentIds) {
      const cacheKey = `${modelId}_${componentId}`;
      const existingStyle = updatedComponentStyles[cacheKey];
      if (existingStyle) {
        updatedComponentStyles[cacheKey] = merge({}, existingStyle, styleValues);
      } else {
        updatedComponentStyles[cacheKey] = merge(
          { id_model: modelId, id_component: componentId },
          styleValues,
        );
      }
    }
    componentStyles.value = updatedComponentStyles;
  }

  function updateModelComponentTypeStyleCache(modelId, componentType, styleValues) {
    const cacheKey = `${modelId}_${componentType}`;
    if (!modelComponentTypeStyles.value[cacheKey]) {
      modelComponentTypeStyles.value[cacheKey] = { id_model: modelId, type: componentType };
    }
    merge(modelComponentTypeStyles.value[cacheKey], styleValues);
  }

  function updateStyleCache(objectId, styleValues) {
    if (!styles.value[objectId]) {
      styles.value[objectId] = { id: objectId };
    }
    merge(styles.value[objectId], styleValues);
  }

  sharedState = {
    styles,
    modelComponentTypeStyles,
    componentStyles,
    loadFromDatabase,
    updateComponentStyleCache,
    bulkUpdateComponentStyleCache,
    bulkUpdateComponentStylesCache,
    updateModelComponentTypeStyleCache,
    updateStyleCache,
  };

  return sharedState;
}

export function useDataStyleState() {
  const dataStyleTable = database.data_style;
  const modelComponentDataStyleTable = database.model_component_datastyle;
  const modelComponentTypeDataStyleTable = database.model_component_type_datastyle;

  const state = getSharedState();
  const { styles, modelComponentTypeStyles, componentStyles } = state;

  const objectVisibility = computed(() => (objectId) => {
    if (styles.value[objectId]) {
      return styles.value[objectId].visibility;
    }
    return false;
  });

  const selectedObjects = computed(() => {
    const visibleObjectIds = [];
    for (const [objectId, objectStyle] of Object.entries(styles.value)) {
      if (objectStyle.visibility === true) {
        visibleObjectIds.push(objectId);
      }
    }
    return visibleObjectIds;
  });

  function getStyle(objectId) {
    return { ...toRaw(styles.value[objectId]) };
  }

  function mutateStyle(objectId, styleValues) {
    state.updateStyleCache(objectId, styleValues);
    const currentStyle = getStyle(objectId);
    merge(currentStyle, styleValues);
    return dataStyleTable.put(structuredClone({ id: objectId, ...toRaw(currentStyle) }));
  }

  function getComponentStyle(modelId, componentId) {
    const cacheKey = `${modelId}_${componentId}`;
    return merge({ coloring: {} }, componentStyles.value[cacheKey]);
  }

  function getModelComponentTypeStyle(modelId, componentType) {
    const cacheKey = `${modelId}_${componentType}`;
    return merge({ coloring: {} }, modelComponentTypeStyles.value[cacheKey]);
  }

  async function clear() {
    await Promise.all([
      dataStyleTable.clear(),
      modelComponentDataStyleTable.clear(),
      modelComponentTypeDataStyleTable.clear(),
    ]);
    modelComponentTypeStyles.value = {};
    componentStyles.value = {};
  }

  return {
    ...state,
    getStyle,
    getComponentStyle,
    getModelComponentTypeStyle,
    mutateStyle,
    objectVisibility,
    selectedObjects,
    clear,
  };
}
