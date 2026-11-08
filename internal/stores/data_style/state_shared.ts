import type {
  ModelComponentStyle,
  ModelComponentTypeStyle,
  ObjectStyle,
  SceneStyle,
  StyleValues,
} from "./types";
import type { ModelId } from "@ogw_front/types/identifiers";
import type { Observable as RxObservable } from "rxjs";
import { getDefaultSceneStyle } from "@ogw_front/utils/default_styles";
import { getTable } from "@ogw_internal/database/database";
import { liveQuery } from "dexie";
import merge from "lodash/merge";
import { useObservable } from "@vueuse/rxjs";

interface SharedState {
  styles: Ref<Record<string, ObjectStyle>>;
  modelComponentTypeStyles: Ref<Record<string, ModelComponentTypeStyle>>;
  componentStyles: Ref<Record<string, ModelComponentStyle>>;
  sceneStyle: Ref<SceneStyle>;
  loadFromDatabase: () => Promise<void>;
  updateComponentStyleCache: (
    modelId: ModelId,
    componentId: string,
    styleValues: StyleValues,
  ) => void;
  bulkUpdateComponentStyleCache: (
    modelId: ModelId,
    componentStyleUpdates: readonly {
      readonly id_component: string;
      readonly values: StyleValues;
    }[],
  ) => void;
  bulkUpdateComponentStylesCache: (
    modelId: ModelId,
    componentIds: readonly string[],
    styleValues: StyleValues,
  ) => void;
  updateModelComponentTypeStyleCache: (
    modelId: ModelId,
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

  const dataStyleTable = getTable<ObjectStyle>("data_style");
  const modelComponentDataStyleTable = getTable<ModelComponentStyle>("model_component_datastyle");
  const modelComponentTypeDataStyleTable = getTable<ModelComponentTypeStyle>(
    "model_component_type_datastyle",
  );

  // Dexie's `liveQuery` returns Dexie's own `Observable` type, structurally distinct
  // From rxjs's `Observable` that `useObservable` (from @vueuse/rxjs) expects, even
  // Though they're interoperable at runtime (both are plain subscribe-based streams).
  const dataStyleLiveQuery = liveQuery(async () => {
    const objectStyles = await dataStyleTable.toArray();
    const stylesByObjectId: Record<string, ObjectStyle> = {};
    for (const objectStyle of objectStyles) {
      stylesByObjectId[objectStyle.data_id] = objectStyle;
    }
    return stylesByObjectId;
  });

  const styles = useObservable<Record<string, ObjectStyle>, Record<string, ObjectStyle>>(
    // oxlint-disable-next-line no-unsafe-type-assertion
    dataStyleLiveQuery as unknown as RxObservable<Record<string, ObjectStyle>>,
    { initialValue: {} },
  ) as Ref<Record<string, ObjectStyle>>;

  const modelComponentTypeStyles = ref<Record<string, ModelComponentTypeStyle>>({});
  const componentStyles = ref<Record<string, ModelComponentStyle>>({});
  const sceneStyleTable = getTable<SceneStyle>("scene_style");
  const sceneStyle = ref<SceneStyle>(getDefaultSceneStyle());

  async function loadFromDatabase(): Promise<void> {
    const [fetchedTypeStyles, fetchedComponentStyles, fetchedSceneStyle] = await Promise.all([
      modelComponentTypeDataStyleTable.toArray(),
      modelComponentDataStyleTable.toArray(),
      sceneStyleTable.get("scene"),
    ]);
    sceneStyle.value = fetchedSceneStyle ?? getDefaultSceneStyle();
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

  void loadFromDatabase();

  function updateComponentStyleCache(
    modelId: ModelId,
    componentId: string,
    styleValues: StyleValues,
  ): void {
    const cacheKey = `${modelId}_${componentId}`;
    const existingStyle = componentStyles.value[cacheKey];
    if (existingStyle === undefined) {
      componentStyles.value[cacheKey] = merge(
        { id_model: modelId, id_component: componentId },
        styleValues,
      );
    } else {
      merge(existingStyle, styleValues);
    }
  }

  function bulkUpdateComponentStyleCache(
    modelId: ModelId,
    componentStyleUpdates: readonly {
      readonly id_component: string;
      readonly values: StyleValues;
    }[],
  ): void {
    const updatedComponentStyles = { ...componentStyles.value };
    for (const { id_component: componentId, values: styleValues } of componentStyleUpdates) {
      const cacheKey = `${modelId}_${componentId}`;
      const existingStyle = updatedComponentStyles[cacheKey];
      if (existingStyle === undefined) {
        updatedComponentStyles[cacheKey] = merge(
          { id_model: modelId, id_component: componentId },
          styleValues,
        );
      } else {
        updatedComponentStyles[cacheKey] = merge({}, existingStyle, styleValues);
      }
    }
    componentStyles.value = updatedComponentStyles;
  }

  function bulkUpdateComponentStylesCache(
    modelId: ModelId,
    componentIds: readonly string[],
    styleValues: StyleValues,
  ): void {
    const updatedComponentStyles = { ...componentStyles.value };
    for (const componentId of componentIds) {
      const cacheKey = `${modelId}_${componentId}`;
      const existingStyle = updatedComponentStyles[cacheKey];
      if (existingStyle === undefined) {
        updatedComponentStyles[cacheKey] = merge(
          { id_model: modelId, id_component: componentId },
          styleValues,
        );
      } else {
        updatedComponentStyles[cacheKey] = merge({}, existingStyle, styleValues);
      }
    }
    componentStyles.value = updatedComponentStyles;
  }

  function updateModelComponentTypeStyleCache(
    modelId: ModelId,
    componentType: string,
    styleValues: StyleValues,
  ): void {
    const cacheKey = `${modelId}_${componentType}`;
    modelComponentTypeStyles.value[cacheKey] ??= { id_model: modelId, type: componentType };
    merge(modelComponentTypeStyles.value[cacheKey], styleValues);
  }

  function updateStyleCache(objectId: string, styleValues: StyleValues): void {
    styles.value[objectId] ??= { data_id: objectId };
    merge(styles.value[objectId], styleValues);
  }

  sharedState = {
    styles,
    modelComponentTypeStyles,
    componentStyles,
    sceneStyle,
    loadFromDatabase,
    updateComponentStyleCache,
    bulkUpdateComponentStyleCache,
    bulkUpdateComponentStylesCache,
    updateModelComponentTypeStyleCache,
    updateStyleCache,
  };

  return sharedState;
}
export { getSharedState };
export type { SharedState };
