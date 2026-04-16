import { database } from "@ogw_internal/database/database";
import { liveQuery } from "dexie";
import merge from "lodash/merge";
import { useObservable } from "@vueuse/rxjs";

export function useDataStyleState() {
  const styles = useObservable(
    liveQuery(async () => {
      const allStyles = await database.data_style.toArray();
      const accumulator = {};
      for (const style of allStyles) {
        accumulator[style.id] = style;
      }
      return accumulator;
    }),
    { initialValue: {} },
  );

  const objectVisibility = computed(() => (id) => {
    if (styles.value[id]) {
      return styles.value[id].visibility;
    }
    return false;
  });

  const selectedObjects = computed(() => {
    const selection = [];
    for (const [id, value] of Object.entries(styles.value)) {
      if (value.visibility === true) {
        selection.push(id);
      }
    }
    return selection;
  });

  const modelComponentTypeStyles = useObservable(
    liveQuery(async () => {
      const all = await database.model_component_type_datastyle.toArray();
      const accumulator = {};
      for (const style of all) {
        const key = `${style.id_model}_${style.type}`;
        accumulator[key] = style;
      }
      return accumulator;
    }),
    { initialValue: {} },
  );

  const componentStyles = useObservable(
    liveQuery(async () => {
      const all = await database.model_component_datastyle.toArray();
      const accumulator = {};
      for (const style of all) {
        const key = `${style.id_model}_${style.id_component}`;
        accumulator[key] = style;
      }
      return accumulator;
    }),
    { initialValue: {} },
  );

  function getStyle(id) {
    return { ...toRaw(styles.value[id]) };
  }

  async function genericMutate(tableName, key, values) {
    const table = database[tableName];
    const entry = (await table.get(key)) || (Array.isArray(key) ? {} : { id: key });
    if (tableName === "model_component_datastyle" && !entry.id_model) {
      [entry.id_model, entry.id_component] = key;
    } else if (tableName === "model_component_type_datastyle" && !entry.id_model) {
      [entry.id_model, entry.type] = key;
    }
    merge(entry, values);
    return table.put(structuredClone(toRaw(entry)));
  }

  function mutateStyle(id, values) {
    return genericMutate("data_style", id, values);
  }

  function getComponentStyle(id_model, id_component) {
    const key = `${id_model}_${id_component}`;
    return componentStyles.value[key] || {};
  }

  function mutateComponentStyle(id_model, id_component, values) {
    return genericMutate("model_component_datastyle", [id_model, id_component], values);
  }

  function getModelComponentTypeStyle(id_model, type) {
    const key = `${id_model}_${type}`;
    return modelComponentTypeStyles.value[key] || {};
  }

  function mutateModelComponentTypeStyle(id_model, type, values) {
    return database.transaction("rw", database.model_component_type_datastyle, () =>
      genericMutate("model_component_type_datastyle", [id_model, type], values),
    );
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
    color_mode,
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

    const params = { id, block_ids: viewer_ids, color_mode };
    if (color_mode === "constant") {
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

  function clear() {
    return Promise.all([
      database.data_style.clear(),
      database.model_component_datastyle.clear(),
      database.model_component_type_datastyle.clear(),
    ]);
  }

  return {
    getStyle,
    getComponentStyle,
    getModelComponentTypeStyle,
    mutateStyle,
    mutateComponentStyle,
    mutateModelComponentTypeStyle,
    mutateComponentStyles,
    bulkMutateComponentStylesPerComponent,
    styles,
    componentStyles,
    modelComponentTypeStyles,
    objectVisibility,
    selectedObjects,
    setModelTypeColor,
    setModelTypeVisibility,
    clear,
  };
}
