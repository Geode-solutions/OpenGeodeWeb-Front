import type { Dexie, Table } from "dexie";
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
type ComponentTable = Table<ModelComponentStyle, [string, string]>;
type ComponentTypeTable = Table<ModelComponentTypeStyle, [string, string]>;

interface ComponentStyleUpdate {
  id_component: string;
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
  const model_component_datastyle_db = componentDatastyleTable();
  const model_component_type_datastyle_db = componentTypeDatastyleTable();

  async function mutateComponentStyle(
    id_model: string,
    id_component: string,
    values: StyleValues,
  ): Promise<unknown> {
    dataStyleState.updateComponentStyleCache(id_model, id_component, values);
    const key: [string, string] = [id_model, id_component];
    const entry: ModelComponentStyle = (await model_component_datastyle_db.get(key)) ?? {
      id_model,
      id_component,
    };
    merge(entry, values);
    return model_component_datastyle_db.put(structuredClone(toRaw(entry)));
  }

  async function mutateModelComponentTypeStyle(
    id_model: string,
    type: string,
    values: StyleValues,
  ): Promise<void> {
    dataStyleState.updateModelComponentTypeStyleCache(id_model, type, values);
    // oxlint-disable-next-line no-unsafe-type-assertion -- the shared database proxy types every table as Dexie; see comment above.
    await (database as unknown as Dexie).transaction(
      "rw",
      model_component_type_datastyle_db,
      async () => {
        const key: [string, string] = [id_model, type];
        const entry: ModelComponentTypeStyle = (await model_component_type_datastyle_db.get(
          key,
        )) ?? {
          id_model,
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
    id_model: string,
    id_components: string[],
    values: StyleValues,
  ): Promise<void> {
    dataStyleState.bulkUpdateComponentStylesCache(id_model, id_components, values);
    // oxlint-disable-next-line no-unsafe-type-assertion -- the shared database proxy types every table as Dexie; see comment above.
    await (database as unknown as Dexie).transaction(
      "rw",
      model_component_datastyle_db,
      async () => {
        const keys: [string, string][] = id_components.map((id_component) => [
          id_model,
          id_component,
        ]);
        const existing = await model_component_datastyle_db.bulkGet(keys);
        const updates = id_components.map((id_component, index) => {
          const style: ModelComponentStyle = existing[index] ?? { id_model, id_component };
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
    id_model: string,
    component_updates: ComponentStyleUpdate[],
  ): Promise<void> {
    dataStyleState.bulkUpdateComponentStyleCache(id_model, component_updates);
    // oxlint-disable-next-line no-unsafe-type-assertion -- the shared database proxy types every table as Dexie; see comment above.
    await (database as unknown as Dexie).transaction(
      "rw",
      model_component_datastyle_db,
      async () => {
        const keys: [string, string][] = component_updates.map((update) => [
          id_model,
          update.id_component,
        ]);
        const existing = await model_component_datastyle_db.bulkGet(keys);
        const updates = component_updates.map(({ id_component, values }, index) => {
          const style: ModelComponentStyle = existing[index] ?? { id_model, id_component };
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
