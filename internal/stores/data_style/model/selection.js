import { MESH_TYPES } from "./constants";
import { database } from "@ogw_internal/database/database";
import { liveQuery } from "dexie";

function buildSelection(modelId, components, stylesMap, typeStylesMap, dataStyleState) {
  const componentsByType = Object.fromEntries(MESH_TYPES.map((type) => [type, []]));
  for (const component of components) {
    if (componentsByType[component.type]) {
      componentsByType[component.type].push(component);
    }
  }

  const groupStyles = dataStyleState.getStyle(modelId);
  const selection = [];
  for (const type of MESH_TYPES) {
    const typeComponents = componentsByType[type];
    if (typeComponents.length === 0) {
      continue;
    }

    const typeKey = `${type.toLowerCase()}s`;
    const typeStyle = typeStylesMap[type];
    const defaultVisibility = typeStyle?.visibility ?? groupStyles[typeKey]?.visibility ?? true;

    let allVisible = true;
    for (const component of typeComponents) {
      const isVisible = stylesMap[component.geode_id]?.visibility ?? defaultVisibility;
      if (isVisible) {
        selection.push(component.geode_id);
      } else {
        allVisible = false;
      }
    }
    if (allVisible) {
      selection.push(type);
    }
  }
  return selection;
}

function useModelSelection(id_ref, dataStyleState) {
  const selection = ref([]);
  watch(
    () => unref(id_ref),
    (modelId, _prev, onCleanup) => {
      if (!modelId) {
        selection.value = [];
        return;
      }
      const observable = liveQuery(async () => {
        const [allComponents, componentStyles, typeStyles] = await Promise.all([
          database.model_components.where("id").equals(modelId).toArray(),
          database.model_component_datastyle.where("id_model").equals(modelId).toArray(),
          database.model_component_type_datastyle.where("id_model").equals(modelId).toArray(),
        ]);

        if (allComponents.length === 0) {
          return [];
        }

        const stylesMap = Object.fromEntries(
          componentStyles.map((style) => [style.id_component, style]),
        );
        const typeStylesMap = Object.fromEntries(typeStyles.map((style) => [style.type, style]));

        return buildSelection(modelId, allComponents, stylesMap, typeStylesMap, dataStyleState);
      });

      const subscription = observable.subscribe({
        next: (val) => {
          selection.value = val;
        },
      });
      onCleanup(() => subscription.unsubscribe());
    },
    { immediate: true },
  );
  return selection;
}

export { buildSelection, useModelSelection };
