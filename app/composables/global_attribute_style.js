import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json";
import { computed } from "vue";

import { getAttributeRange } from "@ogw_front/utils/attributes";
import { useBackStore } from "@ogw_front/stores/back";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

export function useGlobalAttributeStyle(dataIdRef) {
  const dataStyleStore = useDataStyleStore();
  const hybridViewerStore = useHybridViewerStore();
  const backStore = useBackStore();

  const componentNames = [
    { getterKey: "meshPoints", setterKey: "MeshPoints", key: "points" },
    { getterKey: "meshEdges", setterKey: "MeshEdges", key: "edges" },
    { getterKey: "meshPolygons", setterKey: "MeshPolygons", key: "polygons" },
    { getterKey: "meshCells", setterKey: "MeshCells", key: "cells" },
    { getterKey: "meshPolyhedra", setterKey: "MeshPolyhedra", key: "polyhedra" },
  ];

  function getActiveComponents(targetId) {
    const style = dataStyleStore.getStyle(targetId);
    const activeComponents = [];
    if (!style) {
      return activeComponents;
    }
    for (const { key, getterKey, setterKey } of componentNames) {
      if (!style[key] || !style[key].coloring) {
        continue;
      }

      const activeColoring = style[key].coloring.active;
      if (!["vertex", "edge", "polygon", "cell", "polyhedron"].includes(activeColoring)) {
        continue;
      }

      const attributeType = `${activeColoring.charAt(0).toUpperCase()}${activeColoring.slice(1)}Attribute`;
      activeComponents.push({ activeColoring, attributeType, getterKey, setterKey });
    }
    return activeComponents;
  }

  const currentColormap = computed(() => {
    const targetId = dataIdRef.value;
    if (!targetId) {
      return "batlow";
    }

    for (const comp of getActiveComponents(targetId)) {
      const getterName = `${comp.getterKey}${comp.attributeType}ColorMap`;
      const getter = dataStyleStore[getterName];
      if (getter) {
        const colorMap = getter(targetId);
        if (colorMap) {
          return colorMap;
        }
      }
    }

    return "batlow";
  });

  const currentRange = computed({
    get() {
      const targetId = dataIdRef.value;
      if (!targetId) {
        return [0, 1];
      }
      
      for (const comp of getActiveComponents(targetId)) {
        const getterName = `${comp.getterKey}${comp.attributeType}Range`;
        const getter = dataStyleStore[getterName];
        if (getter) {
          const range = getter(targetId);
          if (range && range.length === 2) {
            return range;
          }
        }
      }
      return [0, 1];
    },
    set(newValue) {
      const targetId = dataIdRef.value;
      if (!targetId) {
        return;
      }
      
      let updated = false;
      for (const comp of getActiveComponents(targetId)) {
        const setterName = `set${comp.setterKey}${comp.attributeType}Range`;
        const setter = dataStyleStore[setterName];
        if (setter) {
          setter(targetId, newValue[0], newValue[1]);
          updated = true;
        }
      }
      if (updated) {
        hybridViewerStore.remoteRender();
      }
    }
  });

  async function applyGlobalColormap(newMap) {
    const targetId = dataIdRef.value;
    if (!targetId) {
      return;
    }

    const promises = [];

    for (const comp of getActiveComponents(targetId)) {
      const setterName = `set${comp.setterKey}${comp.attributeType}ColorMap`;
      const setter = dataStyleStore[setterName];

      if (setter) {
        promises.push(setter(targetId, newMap));
      }
    }

    await Promise.all(promises);
    hybridViewerStore.remoteRender();
  }

  function resetGlobalRange() {
    const targetId = dataIdRef.value;
    if (!targetId) {
      return;
    }

    for (const comp of getActiveComponents(targetId)) {
      const { activeColoring, attributeType, getterKey, setterKey } = comp;

      const nameGetter = dataStyleStore[`${getterKey}${attributeType}Name`];
      const itemGetter = dataStyleStore[`${getterKey}${attributeType}Item`];
      if (!nameGetter || !itemGetter) {
        continue;
      }

      const attrName = nameGetter(targetId);
      const attrItem = itemGetter(targetId) ?? 0;

      if (!attrName) {
        continue;
      }

      const schemaName = `${activeColoring}_attribute_names`;
      const schema = back_schemas.opengeodeweb_back[schemaName];
      if (!schema) {
        continue;
      }

      backStore.request(
        { schema, params: { id: targetId } },
        {
          response_function: (response) => {
            const attributes = response.attributes || [];
            const currentAttribute = attributes.find((attr) => attr.attribute_name === attrName);
            if (currentAttribute) {
              const { min, max } = getAttributeRange(currentAttribute, attrItem);

              const setterName = `set${setterKey}${attributeType}Range`;
              const setter = dataStyleStore[setterName];
              if (setter) {
                setter(targetId, min, max);
                hybridViewerStore.remoteRender();
              }
            }
          },
        },
      );
    }
  }

  return {
    currentColormap,
    currentRange,
    applyGlobalColormap,
    resetGlobalRange,
  };
}
