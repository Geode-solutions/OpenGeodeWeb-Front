import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json";
import { computed, type Ref } from "vue";

import { getAttributeRange } from "@ogw_front/utils/attributes";
import { useBackStore } from "@ogw_front/stores/back";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

interface ComponentNameEntry {
  getterKey: string;
  setterKey: string;
  key: string;
}

interface ActiveComponent extends ComponentNameEntry {
  activeColoring: string;
  attributeType: string;
}

// This composable resolves a batch of dynamically-named getter/setter methods on the data style store (e.g. "meshPointsVertexAttributeRange", "setMeshPointsVertexAttributeRange", ...) - the store's real, fully-typed surface has no index signature for this, so dynamic lookups are cast through this loosely-typed view of it, matching how these methods are actually shaped (getters take an id and return a value, setters take an id plus arbitrary arguments).
type DynamicStore = Record<string, ((...args: unknown[]) => unknown) | undefined>;

interface AttributeStyleComponent {
  coloring?: { active?: string };
}

interface AttributeResponse {
  attributes?: {
    attribute_name?: string;
    min_values?: number[];
    max_values?: number[];
    min_value?: number;
    max_value?: number;
  }[];
}

export function useGlobalAttributeStyle(dataIdRef: Ref<string | undefined>) {
  const dataStyleStore = useDataStyleStore();
  const dynamicDataStyleStore = dataStyleStore as unknown as DynamicStore;
  const hybridViewerStore = useHybridViewerStore();
  const backStore = useBackStore();

  const componentNames: ComponentNameEntry[] = [
    { getterKey: "meshPoints", setterKey: "MeshPoints", key: "points" },
    { getterKey: "meshEdges", setterKey: "MeshEdges", key: "edges" },
    { getterKey: "meshPolygons", setterKey: "MeshPolygons", key: "polygons" },
    { getterKey: "meshCells", setterKey: "MeshCells", key: "cells" },
    { getterKey: "meshPolyhedra", setterKey: "MeshPolyhedra", key: "polyhedra" },
  ];

  function getActiveComponents(targetId: string): ActiveComponent[] {
    const style = dataStyleStore.getStyle(targetId) as unknown as Record<
      string,
      AttributeStyleComponent | undefined
    >;
    const activeComponents: ActiveComponent[] = [];
    if (!style) {
      return activeComponents;
    }
    for (const { key, getterKey, setterKey } of componentNames) {
      const componentStyle = style[key];
      if (!componentStyle || !componentStyle.coloring) {
        continue;
      }

      const activeColoring = componentStyle.coloring.active;
      if (
        !activeColoring ||
        !["vertex", "edge", "polygon", "cell", "polyhedron"].includes(activeColoring)
      ) {
        continue;
      }

      const attributeType = `${activeColoring.charAt(0).toUpperCase()}${activeColoring.slice(1)}Attribute`;
      activeComponents.push({ activeColoring, attributeType, getterKey, setterKey, key });
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
      const getter = dynamicDataStyleStore[getterName];
      if (getter) {
        const colorMap = getter(targetId);
        if (colorMap) {
          return colorMap as string;
        }
      }
    }

    return "batlow";
  });

  const currentRange = computed<[number, number]>({
    get() {
      const targetId = dataIdRef.value;
      if (!targetId) {
        return [0, 1];
      }

      for (const comp of getActiveComponents(targetId)) {
        const getterName = `${comp.getterKey}${comp.attributeType}Range`;
        const getter = dynamicDataStyleStore[getterName];
        if (getter) {
          const range = getter(targetId) as number[] | undefined;
          if (range && range.length === 2) {
            return [range[0] ?? 0, range[1] ?? 1];
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
        const setter = dynamicDataStyleStore[setterName];
        if (setter) {
          setter(targetId, newValue[0], newValue[1]);
          updated = true;
        }
      }
      if (updated) {
        hybridViewerStore.remoteRender();
      }
    },
  });

  async function applyGlobalColormap(newMap: string): Promise<void> {
    const targetId = dataIdRef.value;
    if (!targetId) {
      return;
    }

    const promises: Promise<unknown>[] = [];

    for (const comp of getActiveComponents(targetId)) {
      const setterName = `set${comp.setterKey}${comp.attributeType}ColorMap`;
      const setter = dynamicDataStyleStore[setterName];

      if (setter) {
        promises.push(Promise.resolve(setter(targetId, newMap)));
      }
    }

    await Promise.all(promises);
    hybridViewerStore.remoteRender();
  }

  function resetGlobalRange(): void {
    const targetId = dataIdRef.value;
    if (!targetId) {
      return;
    }

    for (const comp of getActiveComponents(targetId)) {
      const { activeColoring, attributeType, getterKey, setterKey } = comp;

      const nameGetter = dynamicDataStyleStore[`${getterKey}${attributeType}Name`];
      const itemGetter = dynamicDataStyleStore[`${getterKey}${attributeType}Item`];
      if (!nameGetter || !itemGetter) {
        continue;
      }

      const attrName = nameGetter(targetId) as string | undefined;
      const attrItem = (itemGetter(targetId) as number | undefined) ?? 0;

      if (!attrName) {
        continue;
      }

      const schemaName = `${activeColoring}_attribute_names`;
      const backSchemas = back_schemas.opengeodeweb_back as Record<string, unknown>;
      const schema = backSchemas[schemaName];
      if (!schema) {
        continue;
      }

      backStore.request(
        { schema: schema as Parameters<typeof backStore.request>[0]["schema"], params: { id: targetId } },
        {
          response_function: (response: unknown) => {
            const attributes = (response as AttributeResponse).attributes || [];
            const currentAttribute = attributes.find((attr) => attr.attribute_name === attrName);
            if (currentAttribute) {
              const { min, max } = getAttributeRange(currentAttribute, attrItem);

              const setterName = `set${setterKey}${attributeType}Range`;
              const setter = dynamicDataStyleStore[setterName];
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
