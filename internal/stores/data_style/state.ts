import type {
  ModelComponentStyle,
  ModelComponentTypeStyle,
  ObjectStyle,
  StyleValues,
} from "./types";
import { type SharedState, getSharedState } from "./state_shared";
import { getTable } from "@ogw_internal/database/database";
import merge from "lodash/merge";

interface DataStyleStateApi extends SharedState {
  getStyle: (objectId: string) => ObjectStyle;
  getComponentStyle: (modelId: string, componentId: string) => ModelComponentStyle;
  getModelComponentTypeStyle: (modelId: string, componentType: string) => ModelComponentTypeStyle;
  mutateStyle: (objectId: string, styleValues: StyleValues) => Promise<string>;
  objectVisibility: ComputedRef<(objectId: string) => boolean | undefined>;
  selectedObjects: ComputedRef<string[]>;
  clear: () => Promise<void>;
}

// oxlint-disable-next-line max-lines-per-function
export function useDataStyleState(): DataStyleStateApi {
  const dataStyleTable = getTable<ObjectStyle>("data_style");
  const modelComponentDataStyleTable = getTable<ModelComponentStyle>("model_component_datastyle");
  const modelComponentTypeDataStyleTable = getTable<ModelComponentTypeStyle>(
    "model_component_type_datastyle",
  );

  const state = getSharedState();
  const { styles, modelComponentTypeStyles, componentStyles } = state;

  const objectVisibility = computed(() => (objectId: string): boolean | undefined => {
    const style = styles.value[objectId];
    if (style !== undefined) {
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
    const style = styles.value[objectId];
    if (style === undefined) {
      return { id: objectId };
    }
    return { ...toRaw(style) };
  }

  async function mutateStyle(objectId: string, styleValues: StyleValues): Promise<string> {
    state.updateStyleCache(objectId, styleValues);
    const currentStyle = getStyle(objectId);
    merge(currentStyle, styleValues);
    const savedId = await dataStyleTable.put(
      structuredClone({ ...toRaw(currentStyle), id: objectId }),
    );
    return savedId;
  }

  function getComponentStyle(modelId: string, componentId: string): ModelComponentStyle {
    const cacheKey = `${modelId}_${componentId}`;
    return merge({ coloring: {} }, componentStyles.value[cacheKey]);
  }

  function getModelComponentTypeStyle(
    modelId: string,
    componentType: string,
  ): ModelComponentTypeStyle {
    const cacheKey = `${modelId}_${componentType}`;
    return merge({ coloring: {} }, modelComponentTypeStyles.value[cacheKey]);
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
