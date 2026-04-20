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

  function mutateStyle(id, values) {
    const style = getStyle(id);
    merge(style, values);
    return database.data_style.put(structuredClone({ id, ...toRaw(style) }));
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
    styles,
    componentStyles,
    modelComponentTypeStyles,
    objectVisibility,
    selectedObjects,
    clear,
  };
}
