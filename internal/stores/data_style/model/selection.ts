import { MESH_COMPONENT_TYPES } from "@ogw_front/utils/default_styles";
import type { Table } from "dexie";
import { database } from "@ogw_internal/database/database";
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

function groupComponentsByType(
  components: readonly ModelComponentRecord[],
): Record<string, ModelComponentRecord[]> {
  const componentsByType: Record<string, ModelComponentRecord[]> = Object.fromEntries(
    MESH_COMPONENT_TYPES.map((componentType) => [componentType, []]),
  );
  for (const component of components) {
    if (componentsByType[component.type] !== undefined) {
      componentsByType[component.type].push(component);
    }
  }
  return componentsByType;
}

interface TypeSelectionContext {
  readonly modelId: string;
  readonly groupStyles: ReturnType<DataStyleState["getStyle"]>;
  readonly dataStyleState: DataStyleState;
}

function computeTypeSelection(
  componentType: string,
  typeComponents: readonly ModelComponentRecord[],
  context: TypeSelectionContext,
): string[] {
  const { modelId, groupStyles, dataStyleState } = context;
  const typeKey = `${componentType.toLowerCase()}s`;
  const typeStyleKey = `${modelId}_${componentType}`;
  const typeStyle = dataStyleState.modelComponentTypeStyles.value[typeStyleKey];
  const defaultVisibility =
    (typeStyle?.visibility as boolean | undefined) ??
    (groupStyles[typeKey]?.visibility as boolean | undefined) ??
    true;

  const selection: string[] = [];
  let allVisible = true;
  for (const component of typeComponents) {
    const styleKey = `${modelId}_${component.geode_id}`;
    const isVisible =
      (dataStyleState.componentStyles.value[styleKey]?.visibility as boolean | undefined) ??
      defaultVisibility;
    if (isVisible) {
      selection.push(component.geode_id);
    } else {
      allVisible = false;
    }
  }
  if (allVisible) {
    selection.push(componentType);
  }
  return selection;
}

function buildSelection(
  modelId: string,
  components: readonly ModelComponentRecord[],
  dataStyleState: DataStyleState,
): string[] {
  const componentsByType = groupComponentsByType(components);
  const groupStyles = dataStyleState.getStyle(modelId);
  const context: TypeSelectionContext = { modelId, groupStyles, dataStyleState };

  const selection: string[] = [];
  for (const componentType of MESH_COMPONENT_TYPES) {
    const typeComponents = componentsByType[componentType];
    if (typeComponents.length === 0) {
      continue;
    }
    selection.push(...computeTypeSelection(componentType, typeComponents, context));
  }
  return selection;
}

const selectionCache = new Map<string, ComputedRef<string[]>>();

function useModelSelection(
  modelId: string | undefined,
  dataStyleState: DataStyleState,
): ComputedRef<string[]> {
  if (modelId === undefined || modelId === "") {
    return computed<string[]>(() => []);
  }

  const cacheKey = modelId;
  const cachedSelection = selectionCache.get(cacheKey);
  if (cachedSelection !== undefined) {
    return cachedSelection;
  }

  const allComponents = ref<ModelComponentRecord[]>([]);

  void (async (): Promise<void> => {
    try {
      allComponents.value = await model_components_db.where("id").equals(modelId).toArray();
    } catch {
      allComponents.value = [];
    }
  })();

  const computedSelection = computed(() => {
    if (allComponents.value.length === 0) {
      return [];
    }
    return buildSelection(modelId, allComponents.value, dataStyleState);
  });

  selectionCache.set(cacheKey, computedSelection);
  return computedSelection;
}

export { buildSelection, useModelSelection };
