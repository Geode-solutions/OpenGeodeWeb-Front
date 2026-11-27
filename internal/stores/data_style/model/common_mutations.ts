import type { ModelComponentId, ModelId } from "@ogw_front/types/identifiers";
import type {
  ModelComponentStyle,
  ModelComponentTypeStyle,
  StyleValues,
} from "@ogw_internal/stores/data_style/types.js";
import {
  componentDataStyleDb,
  componentTypeDataStyleDb,
  writeTransaction,
} from "@ogw_internal/database/database";
import type { ModelComponentType } from "@ogw_front/types/model";
import merge from "lodash/merge";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

interface ComponentStyleUpdate {
  id_component: ModelComponentId;
  values: StyleValues;
}

interface UseModelComponentStyleMutationsReturn {
  mutateComponentStyle: (
    modelId: ModelId,
    componentId: ModelComponentId,
    values: StyleValues,
  ) => Promise<unknown>;
  mutateModelComponentTypeStyle: (
    modelId: ModelId,
    type: ModelComponentType,
    values: StyleValues,
  ) => Promise<void>;
}

interface UseModelComponentsStyleMutationReturn {
  mutateComponentStyles: (
    modelId: ModelId,
    componentIds: ModelComponentId[],
    values: StyleValues,
  ) => Promise<void>;
}

interface UseModelComponentsPerComponentStyleMutationReturn {
  bulkMutateComponentStylesPerComponent: (
    modelId: ModelId,
    componentUpdates: ComponentStyleUpdate[],
  ) => Promise<void>;
}

function useModelComponentStyleMutations(): UseModelComponentStyleMutationsReturn {
  const dataStyleState = useDataStyleState();
  const componentDataStyleTable = componentDataStyleDb();
  const componentTypeDataStyleTable = componentTypeDataStyleDb();

  async function mutateComponentStyle(
    modelId: ModelId,
    componentId: ModelComponentId,
    values: StyleValues,
  ): Promise<unknown> {
    dataStyleState.updateComponentStyleCache(modelId, componentId, values);
    const key: [ModelId, ModelComponentId] = [modelId, componentId];
    const entry: ModelComponentStyle = (await componentDataStyleTable.get(key)) ?? {
      id_model: modelId,
      id_component: componentId,
    };
    merge(entry, values);
    return componentDataStyleTable.put(structuredClone(toRaw(entry)));
  }

  async function mutateModelComponentTypeStyle(
    modelId: ModelId,
    type: ModelComponentType,
    values: StyleValues,
  ): Promise<void> {
    dataStyleState.updateModelComponentTypeStyleCache(modelId, type, values);
    await writeTransaction([componentTypeDataStyleTable], async () => {
      const key: [ModelId, ModelComponentType] = [modelId, type];
      const entry: ModelComponentTypeStyle = (await componentTypeDataStyleTable.get(key)) ?? {
        id_model: modelId,
        type,
      };
      merge(entry, values);
      return componentTypeDataStyleTable.put(structuredClone(toRaw(entry)));
    });
  }

  return {
    mutateComponentStyle,
    mutateModelComponentTypeStyle,
  };
}

function useModelComponentsStyleMutation(): UseModelComponentsStyleMutationReturn {
  const dataStyleState = useDataStyleState();
  const componentDataStyleTable = componentDataStyleDb();

  async function mutateComponentStyles(
    modelId: ModelId,
    componentIds: ModelComponentId[],
    values: StyleValues,
  ): Promise<void> {
    dataStyleState.bulkUpdateComponentStylesCache(modelId, componentIds, values);
    await writeTransaction([componentDataStyleTable], async () => {
      const keys: [ModelId, ModelComponentId][] = componentIds.map((componentId) => [
        modelId,
        componentId,
      ]);
      const existing = await componentDataStyleTable.bulkGet(keys);
      const updates = componentIds.map((componentId, index) => {
        const style: ModelComponentStyle = existing[index] ?? {
          id_model: modelId,
          id_component: componentId,
        };
        merge(style, values);
        return toRaw(style);
      });

      return componentDataStyleTable.bulkPut(structuredClone(updates));
    });
  }

  return {
    mutateComponentStyles,
  };
}

function useModelComponentsPerComponentStyleMutation(): UseModelComponentsPerComponentStyleMutationReturn {
  const dataStyleState = useDataStyleState();
  const componentDataStyleTable = componentDataStyleDb();

  async function bulkMutateComponentStylesPerComponent(
    modelId: ModelId,
    componentUpdates: ComponentStyleUpdate[],
  ): Promise<void> {
    dataStyleState.bulkUpdateComponentStyleCache(modelId, componentUpdates);
    await writeTransaction([componentDataStyleTable], async () => {
      const keys: [ModelId, ModelComponentId][] = componentUpdates.map((update) => [
        modelId,
        update.id_component,
      ]);
      const existing = await componentDataStyleTable.bulkGet(keys);
      const updates = componentUpdates.map(({ id_component, values }, index) => {
        const style: ModelComponentStyle = existing[index] ?? { id_model: modelId, id_component };
        merge(style, values);
        return toRaw(style);
      });
      return componentDataStyleTable.bulkPut(structuredClone(updates));
    });
  }

  return {
    bulkMutateComponentStylesPerComponent,
  };
}
export {
  useModelComponentStyleMutations,
  useModelComponentsStyleMutation,
  useModelComponentsPerComponentStyleMutation,
};
export type { ComponentStyleUpdate };
