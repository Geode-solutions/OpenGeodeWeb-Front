import type { ModelComponentStyle, ModelComponentTypeStyle, StyleValues } from "@ogw_internal/stores/data_style/types.js";
import type { JsonRpcSchema } from "@ogw_shared/utils/types.js";
import type { Dexie, Table } from "dexie";
import { database } from "@ogw_internal/database/database";
import merge from "lodash/merge";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useViewerStore } from "@ogw_front/stores/viewer";

// The underlying dexie tables use compound array keys ([id_model, id_component] /
// [id_model, type]) but the shared `database` proxy types every table as
// Table<Record<string, unknown>, string>. Cast locally to the real key shape.
type ComponentTable = Table<ModelComponentStyle, [string, string]>;
type ComponentTypeTable = Table<ModelComponentTypeStyle, [string, string]>;

interface ComponentStyleUpdate {
  id_component: string;
  values: StyleValues;
}

// oxlint-disable-next-line max-lines-per-function
export function useModelCommonStyle() {
  const dataStore = useDataStore();
  const viewerStore = useViewerStore();
  const dataStyleState = useDataStyleState();
  const model_component_datastyle_db = database.model_component_datastyle as unknown as ComponentTable;
  const model_component_type_datastyle_db =
    database.model_component_type_datastyle as unknown as ComponentTypeTable;

  async function mutateComponentStyle(id_model: string, id_component: string, values: StyleValues) {
    dataStyleState.updateComponentStyleCache(id_model, id_component, values);
    const key: [string, string] = [id_model, id_component];
    const entry: ModelComponentStyle = (await model_component_datastyle_db.get(key)) || {
      id_model,
      id_component,
    };
    merge(entry, values);
    return model_component_datastyle_db.put(structuredClone(toRaw(entry)));
  }

  async function mutateModelComponentTypeStyle(id_model: string, type: string, values: StyleValues) {
    dataStyleState.updateModelComponentTypeStyleCache(id_model, type, values);
    await (database as unknown as Dexie).transaction("rw", model_component_type_datastyle_db, async () => {
      const key: [string, string] = [id_model, type];
      const entry: ModelComponentTypeStyle = (await model_component_type_datastyle_db.get(key)) || {
        id_model,
        type,
      };
      merge(entry, values);
      return model_component_type_datastyle_db.put(structuredClone(toRaw(entry)));
    });
  }

  async function mutateComponentStyles(id_model: string, id_components: string[], values: StyleValues) {
    dataStyleState.bulkUpdateComponentStylesCache(id_model, id_components, values);
    await (database as unknown as Dexie).transaction("rw", model_component_datastyle_db, async () => {
      const keys: [string, string][] = id_components.map((id_component) => [id_model, id_component]);
      const existing = await model_component_datastyle_db.bulkGet(keys);
      const updates = id_components.map((id_component, index) => {
        const style: ModelComponentStyle = existing[index] || { id_model, id_component };
        merge(style, values);
        return toRaw(style);
      });

      return model_component_datastyle_db.bulkPut(structuredClone(updates));
    });
  }

  async function bulkMutateComponentStylesPerComponent(
    id_model: string,
    component_updates: ComponentStyleUpdate[],
  ) {
    dataStyleState.bulkUpdateComponentStyleCache(id_model, component_updates);
    await (database as unknown as Dexie).transaction("rw", model_component_datastyle_db, async () => {
      const keys: [string, string][] = component_updates.map((update) => [
        id_model,
        update.id_component,
      ]);
      const existing = await model_component_datastyle_db.bulkGet(keys);
      const updates = component_updates.map(({ id_component, values }, index) => {
        const style: ModelComponentStyle = existing[index] || { id_model, id_component };
        merge(style, values);
        return toRaw(style);
      });
      return model_component_datastyle_db.bulkPut(structuredClone(updates));
    });
  }

  async function setModelTypeColor(
    id: string,
    component_ids: string[],
    color: unknown,
    schema: JsonRpcSchema,
    activeColoring = "constant",
  ) {
    if (!component_ids?.length) {
      return;
    }

    const viewer_ids = await dataStore.getMeshComponentsViewerIds(id, component_ids);
    if (!viewer_ids?.length) {
      return;
    }

    const params: Record<string, unknown> = {
      id,
      block_ids: viewer_ids,
      color_mode: activeColoring,
    };
    if (activeColoring === "constant") {
      await mutateComponentStyles(id, component_ids, {
        coloring: {
          constant: color,
        },
      });
      params.color = color;
    }

    return viewerStore.request(
      { schema, params },
      {
        response_function: async (response: unknown) => {
          const colors = response as { geode_id: string; color: unknown }[] | undefined;
          if (activeColoring === "constant") {
            await mutateComponentStyles(id, component_ids, {
              coloring: {
                constant: color,
              },
            });
            return;
          }

          if (!colors?.length) {
            return;
          }

          await bulkMutateComponentStylesPerComponent(
            id,
            colors.map(({ geode_id, color: color_value }) => ({
              id_component: geode_id,
              values: {
                coloring: {
                  constant: color_value,
                },
              },
            })),
          );
        },
      },
    );
  }

  async function setModelTypeVisibility(
    id: string,
    component_ids: string[],
    visibility: boolean | undefined,
    schema: JsonRpcSchema,
  ) {
    if (!component_ids?.length) {
      return;
    }

    const viewer_ids = await dataStore.getMeshComponentsViewerIds(id, component_ids);
    if (!viewer_ids?.length) {
      return;
    }
    const params = { id, block_ids: viewer_ids, visibility };
    return viewerStore.request(
      { schema, params },
      {
        response_function: () => mutateComponentStyles(id, component_ids, { visibility }),
      },
    );
  }

  return {
    mutateComponentStyle,
    mutateModelComponentTypeStyle,
    mutateComponentStyles,
    bulkMutateComponentStylesPerComponent,
    setModelTypeColor,
    setModelTypeVisibility,
  };
}
