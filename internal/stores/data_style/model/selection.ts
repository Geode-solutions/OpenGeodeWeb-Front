import type { ModelComponentStyle, ModelComponentTypeStyle, StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { MESH_COMPONENT_TYPES } from "@ogw_front/utils/default_styles";
import { database } from "@ogw_internal/database/database";
import type { Table } from "dexie";
import type { ComputedRef, Ref } from "vue";
import type { useDataStyleState } from "@ogw_internal/stores/data_style/state";

interface ModelComponentRecord {
  id: string;
  geode_id: string;
  type: string;
}

type DataStyleState = ReturnType<typeof useDataStyleState>;

const model_components_db = database.model_components as unknown as Table<
  ModelComponentRecord,
  string
>;

function buildSelection(
  modelId: string,
  components: ModelComponentRecord[],
  componentStyles: Ref<Record<string, ModelComponentStyle>>,
  modelComponentTypeStyles: Ref<Record<string, ModelComponentTypeStyle>>,
  dataStyleState: DataStyleState,
): string[] {
  const componentsByType: Record<string, ModelComponentRecord[]> = Object.fromEntries(
    MESH_COMPONENT_TYPES.map((componentType) => [componentType, []]),
  );
  for (const component of components) {
    if (componentsByType[component.type]) {
      componentsByType[component.type]!.push(component);
    }
  }

  const groupStyles = dataStyleState.getStyle(modelId);
  const selection: string[] = [];
  for (const componentType of MESH_COMPONENT_TYPES) {
    const typeComponents = componentsByType[componentType];
    if (!typeComponents || typeComponents.length === 0) {
      continue;
    }

    const typeKey = `${componentType.toLowerCase()}s`;
    const typeStyleKey = `${modelId}_${componentType}`;
    const typeStyle = modelComponentTypeStyles.value[typeStyleKey];
    const defaultVisibility =
      (typeStyle?.visibility as boolean | undefined) ??
      ((groupStyles[typeKey] as StyleValues | undefined)?.visibility as boolean | undefined) ??
      true;

    let allVisible = true;
    for (const component of typeComponents) {
      const styleKey = `${modelId}_${component.geode_id}`;
      const isVisible =
        (componentStyles.value[styleKey]?.visibility as boolean | undefined) ?? defaultVisibility;
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

const selectionCache = new Map<string, ComputedRef<string[]>>();

function useModelSelection(modelId: string | undefined, dataStyleState: DataStyleState) {
  if (!modelId) {
    return computed<string[]>(() => []);
  }

  const cacheKey = `${modelId}`;
  if (selectionCache.has(cacheKey)) {
    return selectionCache.get(cacheKey)!;
  }

  const allComponents = ref<ModelComponentRecord[]>([]);

  (async () => {
    try {
      allComponents.value = await model_components_db.where("id").equals(modelId).toArray();
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
