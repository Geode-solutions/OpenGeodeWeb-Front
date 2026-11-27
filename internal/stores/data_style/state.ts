import type { ModelComponentId, ModelId } from "@ogw_front/types/identifiers";
import type {
  ModelComponentStyle,
  ModelComponentTypeStyle,
  ObjectStyle,
  StyleValues,
} from "./types";
import { type SharedState, getSharedState } from "./state_shared";
import {
  componentDataStyleDb,
  componentTypeDataStyleDb,
  dataStyleDb,
  sceneStyleDb,
} from "@ogw_internal/database/database";
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import type { ModelComponentType } from "@ogw_front/types/model";
import { getDefaultSceneStyle } from "@ogw_front/utils/default_styles";
import merge from "lodash/merge";

interface DataStyleStateApi extends SharedState {
  getStyle: (objectId: DataId) => ObjectStyle;
  getComponentStyle: (modelId: ModelId, componentId: ModelComponentId) => ModelComponentStyle;
  getModelComponentTypeStyle: (
    modelId: ModelId,
    componentType: ModelComponentType,
  ) => ModelComponentTypeStyle;
  mutateStyle: (objectId: DataId, styleValues: StyleValues) => Promise<DataId>;
  objectVisibility: ComputedRef<(objectId: DataId) => boolean | undefined>;
  selectedObjects: ComputedRef<DataId[]>;
  clear: () => Promise<void>;
}

// oxlint-disable-next-line max-lines-per-function
export function useDataStyleState(): DataStyleStateApi {
  const dataStyleTable = dataStyleDb();
  const modelComponentDataStyleTable = componentDataStyleDb();
  const modelComponentTypeDataStyleTable = componentTypeDataStyleDb();

  const state = getSharedState();
  const { styles, modelComponentTypeStyles, componentStyles } = state;

  const objectVisibility = computed(() => (objectId: DataId): boolean | undefined => {
    const style = styles.value[objectId];
    if (style !== undefined) {
      return style.visibility;
    }
    return false;
  });

  const selectedObjects = computed((): DataId[] => {
    const visibleObjectIds: DataId[] = [];
    for (const [objectId, objectStyle] of Object.entries(styles.value)) {
      if (objectStyle.visibility === true) {
        visibleObjectIds.push(objectId);
      }
    }
    return visibleObjectIds;
  });

  function getStyle(objectId: DataId): ObjectStyle {
    const style = styles.value[objectId];
    if (style === undefined) {
      return { data_id: objectId };
    }
    return { ...toRaw(style) };
  }

  async function mutateStyle(objectId: DataId, styleValues: StyleValues): Promise<DataId> {
    state.updateStyleCache(objectId, styleValues);
    const currentStyle = getStyle(objectId);
    merge(currentStyle, styleValues);
    const savedId = await dataStyleTable.put(
      structuredClone({ ...toRaw(currentStyle), data_id: objectId }),
    );
    return savedId;
  }

  function getComponentStyle(modelId: ModelId, componentId: ModelComponentId): ModelComponentStyle {
    const cacheKey = `${modelId}_${componentId}`;
    return merge({ coloring: {} }, componentStyles.value[cacheKey]);
  }

  function getModelComponentTypeStyle(
    modelId: ModelId,
    componentType: ModelComponentType,
  ): ModelComponentTypeStyle {
    const cacheKey = `${modelId}_${componentType}`;
    return merge({ coloring: {} }, modelComponentTypeStyles.value[cacheKey]);
  }

  async function clear(): Promise<void> {
    await Promise.all([
      dataStyleTable.clear(),
      modelComponentDataStyleTable.clear(),
      modelComponentTypeDataStyleTable.clear(),
      sceneStyleDb().clear(),
    ]);
    modelComponentTypeStyles.value = {};
    componentStyles.value = {};
    state.sceneStyle.value = getDefaultSceneStyle();
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
