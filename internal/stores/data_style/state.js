import { database } from "@ogw_internal/database/database";
import { liveQuery } from "dexie";
import merge from "lodash/merge";
import { useObservable } from "@vueuse/rxjs";

let sharedState = undefined;

function getSharedState() {
  if (sharedState) {
    return sharedState;
  }

  const data_style_db = database.data_style;
  const model_component_datastyle_db = database.model_component_datastyle;
  const model_component_type_datastyle_db = database.model_component_type_datastyle;

  const styles = useObservable(
    liveQuery(async () => {
      const allStyles = await data_style_db.toArray();
      const accumulator = {};
      for (const style of allStyles) {
        accumulator[style.id] = style;
      }
      return accumulator;
    }),
    { initialValue: {} },
  );

  const modelComponentTypeStyles = useObservable(
    liveQuery(async () => {
      const all = await model_component_type_datastyle_db.toArray();
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
      const all = await model_component_datastyle_db.toArray();
      const accumulator = {};
      for (const style of all) {
        const key = `${style.id_model}_${style.id_component}`;
        accumulator[key] = style;
      }
      return accumulator;
    }),
    { initialValue: {} },
  );

  function updateComponentStyleCache(id_model, id_component, values) {
    const key = `${id_model}_${id_component}`;
    if (!componentStyles.value[key]) {
      componentStyles.value[key] = { id_model, id_component };
    }
    merge(componentStyles.value[key], values);
  }

  function updateModelComponentTypeStyleCache(id_model, type, values) {
    const key = `${id_model}_${type}`;
    if (!modelComponentTypeStyles.value[key]) {
      modelComponentTypeStyles.value[key] = { id_model, type };
    }
    merge(modelComponentTypeStyles.value[key], values);
  }

  function updateStyleCache(id, values) {
    if (!styles.value[id]) {
      styles.value[id] = { id };
    }
    merge(styles.value[id], values);
  }

  sharedState = {
    styles,
    modelComponentTypeStyles,
    componentStyles,
    updateComponentStyleCache,
    updateModelComponentTypeStyleCache,
    updateStyleCache,
  };

  return sharedState;
}

export function useDataStyleState() {
  const data_style_db = database.data_style;
  const model_component_datastyle_db = database.model_component_datastyle;
  const model_component_type_datastyle_db = database.model_component_type_datastyle;

  const state = getSharedState();
  const { styles, modelComponentTypeStyles, componentStyles } = state;

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

  function getStyle(id) {
    return { ...toRaw(styles.value[id]) };
  }

  function mutateStyle(id, values) {
    state.updateStyleCache(id, values);
    const style = getStyle(id);
    merge(style, values);
    return data_style_db.put(structuredClone({ id, ...toRaw(style) }));
  }

  function getComponentStyle(id_model, id_component) {
    const key = `${id_model}_${id_component}`;
    return componentStyles.value[key] || {};
  }

  function getModelComponentTypeStyle(id_model, type) {
    const key = `${id_model}_${type}`;
    return modelComponentTypeStyles.value[key] || {};
  }

  function clear() {
    return Promise.all([
      data_style_db.clear(),
      model_component_datastyle_db.clear(),
      model_component_type_datastyle_db.clear(),
    ]);
  }

  return {
    getStyle,
    getComponentStyle,
    getModelComponentTypeStyle,
    mutateStyle,
    styles,
    componentStyles,
    modelComponentTypeStyles,
    objectVisibility,
    selectedObjects,
    clear,
    updateComponentStyleCache: state.updateComponentStyleCache,
    updateModelComponentTypeStyleCache: state.updateModelComponentTypeStyleCache,
  };
}
