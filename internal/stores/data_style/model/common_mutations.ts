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
import merge from "lodash/merge";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

interface ComponentStyleUpdate {
  id_component: string;
  values: StyleValues;
}

interface UseModelComponentStyleMutationsReturn {
  mutateComponentStyle: (
    id_model: string,
    id_component: string,
    values: StyleValues,
  ) => Promise<unknown>;
  mutateModelComponentTypeStyle: (
    id_model: string,
    type: string,
    values: StyleValues,
  ) => Promise<void>;
}

interface UseModelComponentsStyleMutationReturn {
  mutateComponentStyles: (
    id_model: string,
    id_components: string[],
    values: StyleValues,
  ) => Promise<void>;
}

interface UseModelComponentsPerComponentStyleMutationReturn {
  bulkMutateComponentStylesPerComponent: (
    id_model: string,
    component_updates: ComponentStyleUpdate[],
  ) => Promise<void>;
}

function useModelComponentStyleMutations(): UseModelComponentStyleMutationsReturn {
  const dataStyleState = useDataStyleState();
  const componentDataStyleTable = componentDataStyleDb();
  const componentTypeDataStyleTable = componentTypeDataStyleDb();

  async function mutateComponentStyle(
    id_model: string,
    id_component: string,
    values: StyleValues,
  ): Promise<unknown> {
    dataStyleState.updateComponentStyleCache(id_model, id_component, values);
    const key: [string, string] = [id_model, id_component];
    const entry: ModelComponentStyle = (await componentDataStyleTable.get(key)) ?? {
      id_model,
      id_component,
    };
    merge(entry, values);
    return componentDataStyleTable.put(structuredClone(toRaw(entry)));
  }

  async function mutateModelComponentTypeStyle(
    id_model: string,
    type: string,
    values: StyleValues,
  ): Promise<void> {
    dataStyleState.updateModelComponentTypeStyleCache(id_model, type, values);
    await writeTransaction([componentTypeDataStyleTable], async () => {
      const key: [string, string] = [id_model, type];
      const entry: ModelComponentTypeStyle = (await componentTypeDataStyleTable.get(key)) ?? {
        id_model,
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
    id_model: string,
    id_components: string[],
    values: StyleValues,
  ): Promise<void> {
    dataStyleState.bulkUpdateComponentStylesCache(id_model, id_components, values);
    await writeTransaction([componentDataStyleTable], async () => {
      const keys: [string, string][] = id_components.map((id_component) => [
        id_model,
        id_component,
      ]);
      const existing = await componentDataStyleTable.bulkGet(keys);
      const updates = id_components.map((id_component, index) => {
        const style: ModelComponentStyle = existing[index] ?? { id_model, id_component };
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
    id_model: string,
    component_updates: ComponentStyleUpdate[],
  ): Promise<void> {
    dataStyleState.bulkUpdateComponentStyleCache(id_model, component_updates);
    await writeTransaction([componentDataStyleTable], async () => {
      const keys: [string, string][] = component_updates.map((update) => [
        id_model,
        update.id_component,
      ]);
      const existing = await componentDataStyleTable.bulkGet(keys);
      const updates = component_updates.map(({ id_component, values }, index) => {
        const style: ModelComponentStyle = existing[index] ?? { id_model, id_component };
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
