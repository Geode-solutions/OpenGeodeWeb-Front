import { database } from "@ogw_internal/database/database";
import merge from "lodash/merge";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useViewerStore } from "@ogw_front/stores/viewer";

// oxlint-disable-next-line max-lines-per-function
export function useModelCommonStyle() {
  const dataStore = useDataStore();
  const viewerStore = useViewerStore();
  const dataStyleState = useDataStyleState();
  const model_component_datastyle_db = database.model_component_datastyle;
  const model_component_type_datastyle_db = database.model_component_type_datastyle;

  async function mutateComponentStyle(id_model, id_component, values) {
    dataStyleState.updateComponentStyleCache(id_model, id_component, values);
    const key = [id_model, id_component];
    const entry = (await model_component_datastyle_db.get(key)) || { id_model, id_component };
    merge(entry, values);
    return model_component_datastyle_db.put(structuredClone(toRaw(entry)));
  }

  function mutateModelComponentTypeStyle(id_model, type, values) {
    dataStyleState.updateModelComponentTypeStyleCache(id_model, type, values);
    return database.transaction("rw", model_component_type_datastyle_db, async () => {
      const key = [id_model, type];
      const entry = (await model_component_type_datastyle_db.get(key)) || { id_model, type };
      merge(entry, values);
      return model_component_type_datastyle_db.put(structuredClone(toRaw(entry)));
    });
  }

  function mutateComponentStyles(id_model, id_components, values) {
    dataStyleState.bulkUpdateComponentStylesCache(id_model, id_components, values);
    return database.transaction("rw", model_component_datastyle_db, async () => {
      const keys = id_components.map((id_component) => [id_model, id_component]);
      const existing = await model_component_datastyle_db.bulkGet(keys);
      const updates = id_components.map((id_component, index) => {
        const style = existing[index] || { id_model, id_component };
        merge(style, values);
        return toRaw(style);
      });

      return model_component_datastyle_db.bulkPut(structuredClone(updates));
    });
  }

  function bulkMutateComponentStylesPerComponent(id_model, component_updates) {
    dataStyleState.bulkUpdateComponentStyleCache(id_model, component_updates);
    return database.transaction("rw", model_component_datastyle_db, async () => {
      const keys = component_updates.map((update) => [id_model, update.id_component]);
      const existing = await model_component_datastyle_db.bulkGet(keys);
      const updates = component_updates.map(({ id_component, values }, index) => {
        const style = existing[index] || { id_model, id_component };
        merge(style, values);
        return toRaw(style);
      });
      return model_component_datastyle_db.bulkPut(structuredClone(updates));
    });
  }

  async function setModelTypeColor(id, component_ids, color, schema, activeColoring = "constant") {
    if (!component_ids?.length) {
      return;
    }

    const viewer_ids = await dataStore.getMeshComponentsViewerIds(id, component_ids);
    if (!viewer_ids?.length) {
      return;
    }

    const params = { id, block_ids: viewer_ids, color_mode: activeColoring };
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
        response_function: async (colors) => {
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

  async function setModelTypeVisibility(id, component_ids, visibility, schema) {
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
