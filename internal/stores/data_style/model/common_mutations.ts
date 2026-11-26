import type { Dexie, Table } from "dexie";
import type { ModelComponentId, ModelId } from "@ogw_front/types/identifiers";
import type {
  ModelComponentStyle,
  ModelComponentTypeStyle,
  StyleValues,
} from "@ogw_internal/stores/data_style/types.js";
import { database } from "@ogw_internal/database/database";
import merge from "lodash/merge";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

// The underlying dexie tables use compound array keys ([id_model, id_component] /
// [id_model, type]) but the shared `database` proxy types every table as
// Table<Record<string, unknown>, string>. Cast locally to the real key shape.
type ComponentTable = Table<ModelComponentStyle, [ModelId, ModelComponentId]>;
type ComponentTypeTable = Table<ModelComponentTypeStyle, [ModelId, string]>;

interface ComponentStyleUpdate {
  id_component: ModelComponentId;
  values: StyleValues;
}

function componentDatastyleTable(): ComponentTable {
  // oxlint-disable-next-line no-unsafe-type-assertion -- compound-key table cast; see comment above.
  return database.model_component_datastyle as unknown as ComponentTable;
}

function componentTypeDatastyleTable(): ComponentTypeTable {
  // oxlint-disable-next-line no-unsafe-type-assertion -- compound-key table cast; see comment above.
  return database.model_component_type_datastyle as unknown as ComponentTypeTable;
}

interface UseModelComponentStyleMutationsReturn {
  mutateComponentStyle: (
    modelId: ModelId,
    componentId: ModelComponentId,
    values: StyleValues,
  ) => Promise<unknown>;
  mutateModelComponentTypeStyle: (
    modelId: ModelId,
    type: string,
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
  const model_component_datastyle_db = componentDatastyleTable();
  const model_component_type_datastyle_db = componentTypeDatastyleTable();

  async function mutateComponentStyle(
    modelId: ModelId,
    componentId: ModelComponentId,
    values: StyleValues,
  ): Promise<unknown> {
    dataStyleState.updateComponentStyleCache(modelId, componentId, values);
    const key: [ModelId, ModelComponentId] = [modelId, componentId];
    const entry: ModelComponentStyle = (await model_component_datastyle_db.get(key)) ?? {
      id_model: modelId,
      id_component: componentId,
    };
    merge(entry, values);
    return model_component_datastyle_db.put(structuredClone(toRaw(entry)));
  }

  async function mutateModelComponentTypeStyle(
    modelId: ModelId,
    type: string,
    values: StyleValues,
  ): Promise<void> {
    dataStyleState.updateModelComponentTypeStyleCache(modelId, type, values);
    // oxlint-disable-next-line no-unsafe-type-assertion -- the shared database proxy types every table as Dexie; see comment above.
    await (database as unknown as Dexie).transaction(
      "rw",
      model_component_type_datastyle_db,
      async () => {
        const key: [ModelId, string] = [modelId, type];
        const entry: ModelComponentTypeStyle = (await model_component_type_datastyle_db.get(
          key,
        )) ?? {
          id_model: modelId,
          type,
        };
        merge(entry, values);
        return model_component_type_datastyle_db.put(structuredClone(toRaw(entry)));
      },
    );
  }

  return {
    mutateComponentStyle,
    mutateModelComponentTypeStyle,
  };
}

function useModelComponentsStyleMutation(): UseModelComponentsStyleMutationReturn {
  const dataStyleState = useDataStyleState();
  const model_component_datastyle_db = componentDatastyleTable();

  async function mutateComponentStyles(
    modelId: ModelId,
    componentIds: ModelComponentId[],
    values: StyleValues,
  ): Promise<void> {
    dataStyleState.bulkUpdateComponentStylesCache(modelId, componentIds, values);
    // oxlint-disable-next-line no-unsafe-type-assertion -- the shared database proxy types every table as Dexie; see comment above.
    await (database as unknown as Dexie).transaction(
      "rw",
      model_component_datastyle_db,
      async () => {
        const keys: [ModelId, ModelComponentId][] = componentIds.map((componentId) => [
          modelId,
          componentId,
        ]);
        const existing = await model_component_datastyle_db.bulkGet(keys);
        const updates = componentIds.map((componentId, index) => {
          const style: ModelComponentStyle = existing[index] ?? {
            id_model: modelId,
            id_component: componentId,
          };
          merge(style, values);
          return toRaw(style);
        });

        return model_component_datastyle_db.bulkPut(structuredClone(updates));
      },
    );
  }

  return {
    mutateComponentStyles,
  };
}

function useModelComponentsPerComponentStyleMutation(): UseModelComponentsPerComponentStyleMutationReturn {
  const dataStyleState = useDataStyleState();
  const model_component_datastyle_db = componentDatastyleTable();

  async function bulkMutateComponentStylesPerComponent(
    modelId: ModelId,
    componentUpdates: ComponentStyleUpdate[],
  ): Promise<void> {
    dataStyleState.bulkUpdateComponentStyleCache(modelId, componentUpdates);
    // oxlint-disable-next-line no-unsafe-type-assertion -- the shared database proxy types every table as Dexie; see comment above.
    await (database as unknown as Dexie).transaction(
      "rw",
      model_component_datastyle_db,
      async () => {
        const keys: [ModelId, ModelComponentId][] = componentUpdates.map((update) => [
          modelId,
          update.id_component,
        ]);
        const existing = await model_component_datastyle_db.bulkGet(keys);
        const updates = componentUpdates.map(({ id_component, values }, index) => {
          const style: ModelComponentStyle = existing[index] ?? { id_model: modelId, id_component };
          merge(style, values);
          return toRaw(style);
        });
        return model_component_datastyle_db.bulkPut(structuredClone(updates));
      },
    );
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
