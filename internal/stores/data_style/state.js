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

  function mutateComponentStyle(id_model, id_component, values) {
    return database.model_component_datastyle.get([id_model, id_component]).then((style) => {
      const component_style = style || { id_model, id_component };
      merge(component_style, values);
      return database.model_component_datastyle.put(structuredClone(toRaw(component_style)));
    });
  }

  function getModelComponentTypeStyle(id_model, type) {
    const key = `${id_model}_${type}`;
    return modelComponentTypeStyles.value[key] || {};
  }

  function mutateModelComponentTypeStyle(id_model, type, values) {
    return database.model_component_type_datastyle.get([id_model, type]).then((style) => {
      const model_component_type_style = style || { id_model, type };
      merge(model_component_type_style, values);
      return database.model_component_type_datastyle.put(
        structuredClone(toRaw(model_component_type_style)),
      );
    });
  }

  function mutateComponentStyles(id_model, id_components, values) {
    return database.model_component_datastyle
      .where("id_model")
      .equals(id_model)
      .toArray()
      .then((all_styles) => {
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
    styles,
    componentStyles,
    modelComponentTypeStyles,
    objectVisibility,
    selectedObjects,
    clear,
  };
}
