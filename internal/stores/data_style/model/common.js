import { database } from "@ogw_internal/database/database";
import merge from "lodash/merge";

export function useModelCommonStyle() {
  async function mutateComponentStyle(id_model, id_component, values) {
    const table = database.model_component_datastyle;
    const key = [id_model, id_component];
    const entry = (await table.get(key)) || { id_model, id_component };
    merge(entry, values);
    return table.put(structuredClone(toRaw(entry)));
  }

  function mutateModelComponentTypeStyle(id_model, type, values) {
    return database.transaction("rw", database.model_component_type_datastyle, async () => {
      const table = database.model_component_type_datastyle;
      const key = [id_model, type];
      const entry = (await table.get(key)) || { id_model, type };
      merge(entry, values);
      return table.put(structuredClone(toRaw(entry)));
    });
  }

  function mutateComponentStyles(id_model, id_components, values) {
    return database.transaction("rw", database.model_component_datastyle, async () => {
      const all_styles = await database.model_component_datastyle
        .where("id_model")
        .equals(id_model)
        .toArray();

      const style_map = {};
      for (const style of all_styles) {
        style_map[style.id_component] = style;
      }

      const updates = id_components.map((id_component) => {
        const style = style_map[id_component] || { id_model, id_component };
        merge(style, values);
        return toRaw(style);
      });

      return database.model_component_datastyle.bulkPut(structuredClone(updates));
    });
  }

  function bulkMutateComponentStylesPerComponent(id_model, component_updates) {
    return database.transaction("rw", database.model_component_datastyle, async () => {
      const component_ids = new Set(component_updates.map((update) => update.id_component));
      const all_styles = await database.model_component_datastyle
        .where("id_model")
        .equals(id_model)
        .and((style) => component_ids.has(style.id_component))
        .toArray();
      const style_map = Object.fromEntries(all_styles.map((style) => [style.id_component, style]));
      const updates = component_updates.map(({ id_component, values }) => {
        const style = style_map[id_component] || { id_model, id_component };
        merge(style, values);
        return toRaw(style);
      });
      return database.model_component_datastyle.bulkPut(structuredClone(updates));
    });
  }

  async function setModelTypeColor(
    id,
    component_ids,
    color,
    schema,
    { dataStore, viewerStore },
    color_mode = "constant",
  ) {
    if (!component_ids?.length) {
      return;
    }

    const viewer_ids = await dataStore.getMeshComponentsViewerIds(id, component_ids);
    if (!viewer_ids?.length) {
      return;
    }

    const params = { id, block_ids: viewer_ids, color_mode };
    if (color_mode === "constant" && color !== undefined) {
      params.color = color;
    }

    const colors = await viewerStore.request(schema, params);
    if (!colors?.length) {
      return;
    }

    return bulkMutateComponentStylesPerComponent(
      id,
      colors.map(({ geode_id, color: color_value }) => ({
        id_component: geode_id,
        values: { color: color_value },
      })),
    );
  }

  async function setModelTypeVisibility(
    id,
    component_ids,
    visibility,
    schema,
    { dataStore, viewerStore },
  ) {
    if (!component_ids?.length) {
      return;
    }

    const viewer_ids = await dataStore.getMeshComponentsViewerIds(id, component_ids);
    if (!viewer_ids?.length) {
      return;
    }

    await viewerStore.request(schema, { id, block_ids: viewer_ids, visibility });
    return mutateComponentStyles(id, component_ids, { visibility });
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
