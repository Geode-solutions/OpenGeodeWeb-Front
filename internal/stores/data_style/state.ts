import type { ModelComponentStyle, ModelComponentTypeStyle, ObjectStyle, StyleValues } from "./types";
import { database } from "@ogw_internal/database/database";
import { liveQuery } from "dexie";
import merge from "lodash/merge";
import { useObservable } from "@vueuse/rxjs";
import type { Ref } from "vue";
import type { Observable as RxObservable } from "rxjs";

interface SharedState {
  styles: Ref<Record<string, ObjectStyle>>;
  modelComponentTypeStyles: Ref<Record<string, ModelComponentTypeStyle>>;
  componentStyles: Ref<Record<string, ModelComponentStyle>>;
  loadFromDatabase: () => Promise<void>;
  updateComponentStyleCache: (modelId: string, componentId: string, styleValues: StyleValues) => void;
  bulkUpdateComponentStyleCache: (
    modelId: string,
    componentStyleUpdates: { id_component: string; values: StyleValues }[],
  ) => void;
  bulkUpdateComponentStylesCache: (
    modelId: string,
    componentIds: string[],
    styleValues: StyleValues,
  ) => void;
  updateModelComponentTypeStyleCache: (
    modelId: string,
    componentType: string,
    styleValues: StyleValues,
  ) => void;
  updateStyleCache: (objectId: string, styleValues: StyleValues) => void;
}

let sharedState: SharedState | undefined = undefined;

// oxlint-disable-next-line max-lines-per-function
function getSharedState(): SharedState {
  if (sharedState) {
    return sharedState;
  }

  const dataStyleTable = database.data_style!;
  const modelComponentDataStyleTable = database.model_component_datastyle!;
  const modelComponentTypeDataStyleTable = database.model_component_type_datastyle!;

  // Dexie's `liveQuery` returns Dexie's own `Observable` type, structurally distinct
  // from rxjs's `Observable` that `useObservable` (from @vueuse/rxjs) expects, even
  // though they're interoperable at runtime (both are plain subscribe-based streams).
  const styles = useObservable<Record<string, ObjectStyle>, Record<string, ObjectStyle>>(
    liveQuery(async () => {
      const objectStyles = (await dataStyleTable.toArray()) as ObjectStyle[];
      const stylesByObjectId: Record<string, ObjectStyle> = {};
      for (const objectStyle of objectStyles) {
        stylesByObjectId[objectStyle.id] = objectStyle;
      }
      return stylesByObjectId;
    }) as unknown as RxObservable<Record<string, ObjectStyle>>,
    { initialValue: {} },
  ) as Ref<Record<string, ObjectStyle>>;

  const modelComponentTypeStyles = ref<Record<string, ModelComponentTypeStyle>>({});
  const componentStyles = ref<Record<string, ModelComponentStyle>>({});

  async function loadFromDatabase() {
    const [fetchedTypeStyles, fetchedComponentStyles] = await Promise.all([
      modelComponentTypeDataStyleTable.toArray() as unknown as Promise<ModelComponentTypeStyle[]>,
      modelComponentDataStyleTable.toArray() as unknown as Promise<ModelComponentStyle[]>,
    ]);
    const typeStylesMap: Record<string, ModelComponentTypeStyle> = {};
    for (const typeStyle of fetchedTypeStyles) {
      const cacheKey = `${typeStyle.id_model}_${typeStyle.type}`;
      typeStylesMap[cacheKey] = typeStyle;
    }
    modelComponentTypeStyles.value = typeStylesMap;

    const componentStylesMap: Record<string, ModelComponentStyle> = {};
    for (const componentStyle of fetchedComponentStyles) {
      const cacheKey = `${componentStyle.id_model}_${componentStyle.id_component}`;
      componentStylesMap[cacheKey] = componentStyle;
    }
    componentStyles.value = componentStylesMap;
  }

  loadFromDatabase();

  function updateComponentStyleCache(modelId: string, componentId: string, styleValues: StyleValues) {
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

  function bulkUpdateComponentStyleCache(
    modelId: string,
    componentStyleUpdates: { id_component: string; values: StyleValues }[],
  ) {
    const updatedComponentStyles = { ...componentStyles.value };
    for (const { id_component: componentId, values: styleValues } of componentStyleUpdates) {
      const cacheKey = `${modelId}_${componentId}`;
      const existingStyle = updatedComponentStyles[cacheKey];
      if (existingStyle) {
        updatedComponentStyles[cacheKey] = merge({}, existingStyle, styleValues) as ModelComponentStyle;
      } else {
        updatedComponentStyles[cacheKey] = merge(
          { id_model: modelId, id_component: componentId },
          styleValues,
        );
      }
    }
    componentStyles.value = updatedComponentStyles;
  }

  function bulkUpdateComponentStylesCache(modelId: string, componentIds: string[], styleValues: StyleValues) {
    const updatedComponentStyles = { ...componentStyles.value };
    for (const componentId of componentIds) {
      const cacheKey = `${modelId}_${componentId}`;
      const existingStyle = updatedComponentStyles[cacheKey];
      if (existingStyle) {
        updatedComponentStyles[cacheKey] = merge({}, existingStyle, styleValues) as ModelComponentStyle;
      } else {
        updatedComponentStyles[cacheKey] = merge(
          { id_model: modelId, id_component: componentId },
          styleValues,
        );
      }
    }
    componentStyles.value = updatedComponentStyles;
  }

  function updateModelComponentTypeStyleCache(
    modelId: string,
    componentType: string,
    styleValues: StyleValues,
  ) {
    const cacheKey = `${modelId}_${componentType}`;
    if (!modelComponentTypeStyles.value[cacheKey]) {
      modelComponentTypeStyles.value[cacheKey] = { id_model: modelId, type: componentType };
    }
    merge(modelComponentTypeStyles.value[cacheKey], styleValues);
  }

  function updateStyleCache(objectId: string, styleValues: StyleValues) {
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

// oxlint-disable-next-line max-lines-per-function
export function useDataStyleState() {
  const dataStyleTable = database.data_style!;
  const modelComponentDataStyleTable = database.model_component_datastyle!;
  const modelComponentTypeDataStyleTable = database.model_component_type_datastyle!;

  const state = getSharedState();
  const { styles, modelComponentTypeStyles, componentStyles } = state;

  const objectVisibility = computed(() => (objectId: string): boolean | undefined => {
    const style = styles.value[objectId];
    if (style) {
      return style.visibility;
    }
    return false;
  });

  const selectedObjects = computed((): string[] => {
    const visibleObjectIds: string[] = [];
    for (const [objectId, objectStyle] of Object.entries(styles.value)) {
      if (objectStyle.visibility === true) {
        visibleObjectIds.push(objectId);
      }
    }
    return visibleObjectIds;
  });

  function getStyle(objectId: string): ObjectStyle {
    return { ...toRaw(styles.value[objectId]) } as ObjectStyle;
  }

  function mutateStyle(objectId: string, styleValues: StyleValues) {
    state.updateStyleCache(objectId, styleValues);
    const currentStyle = getStyle(objectId);
    merge(currentStyle, styleValues);
    return dataStyleTable.put(structuredClone({ ...toRaw(currentStyle), id: objectId }));
  }

  function getComponentStyle(modelId: string, componentId: string): ModelComponentStyle {
    const cacheKey = `${modelId}_${componentId}`;
    return merge({ coloring: {} }, componentStyles.value[cacheKey]) as ModelComponentStyle;
  }

  function getModelComponentTypeStyle(modelId: string, componentType: string): ModelComponentTypeStyle {
    const cacheKey = `${modelId}_${componentType}`;
    return merge({ coloring: {} }, modelComponentTypeStyles.value[cacheKey]) as ModelComponentTypeStyle;
  }

  async function clear(): Promise<void> {
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
