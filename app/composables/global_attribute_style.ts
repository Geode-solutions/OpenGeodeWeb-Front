import type { JsonRpcSchema } from "@ogw_shared/utils/types";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json";
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

// This composable resolves a batch of dynamically-named getter/setter methods on the data style store (e.g. "meshPointsVertexAttributeRange", "setMeshPointsVertexAttributeRange", ...) - the store's real, fully-typed surface has no index signature for this, so dynamic lookups go through this type guard instead of an unsafe cast of the whole store (which mixes these methods with state refs and other members), matching how these methods are actually shaped (getters take an id and return a value, setters take an id plus arbitrary arguments).
type DynamicStoreMethod = (...args: readonly unknown[]) => unknown;

function isDynamicStoreMethod(value: unknown): value is DynamicStoreMethod {
  return typeof value === "function";
}

function getDynamicStoreMethod(store: object, key: string): DynamicStoreMethod | undefined {
  const value: unknown = Reflect.get(store, key);
  return isDynamicStoreMethod(value) ? value : undefined;
}

interface AttributeStyleComponent {
  coloring?: { active?: string };
}

interface AttributeResponse {
  readonly attributes?: readonly {
    readonly attribute_name?: string;
    readonly min_values?: readonly number[];
    readonly max_values?: readonly number[];
    readonly min_value?: number;
    readonly max_value?: number;
  }[];
}

function isColoringValue(
  value: unknown,
): value is NonNullable<AttributeStyleComponent["coloring"]> {
  return typeof value === "object" && value !== null;
}

function isJsonRpcSchema(value: unknown): value is JsonRpcSchema {
  return (
    typeof value === "object" && value !== null && "$id" in value && typeof value.$id === "string"
  );
}

function isAttributeResponse(value: unknown): value is AttributeResponse {
  return typeof value === "object" && value !== null;
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === "number");
}

function isStringOrUndefined(value: unknown): value is string | undefined {
  return value === undefined || typeof value === "string";
}

function isNumberOrUndefined(value: unknown): value is number | undefined {
  return value === undefined || typeof value === "number";
}

export function useGlobalAttributeStyle(dataIdRef: Ref<string | undefined>): {
  currentColormap: typeof currentColormap;
  currentRange: typeof currentRange;
  applyGlobalColormap: typeof applyGlobalColormap;
  resetGlobalRange: typeof resetGlobalRange;
} {
  const dataStyleStore = useDataStyleStore();
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
    const style = dataStyleStore.getStyle(targetId);
    const activeComponents: ActiveComponent[] = [];
    for (const { key, getterKey, setterKey } of componentNames) {
      let componentStyle: Record<string, unknown> | undefined = undefined;
      switch (key) {
        case "points": {
          componentStyle = style.points;
          break;
        }
        case "edges": {
          componentStyle = style.edges;
          break;
        }
        case "polygons": {
          componentStyle = style.polygons;
          break;
        }
        case "cells": {
          componentStyle = style.cells;
          break;
        }
        case "polyhedra": {
          componentStyle = style.polyhedra;
          break;
        }
        default: {
          componentStyle = undefined;
        }
      }
      if (componentStyle === undefined) {
        continue;
      }

      const { coloring } = componentStyle;
      if (!isColoringValue(coloring)) {
        continue;
      }

      const { active: activeColoring } = coloring;
      if (
        activeColoring === undefined ||
        !["vertex", "edge", "polygon", "cell", "polyhedron"].includes(activeColoring)
      ) {
        continue;
      }

      const attributeType = `${activeColoring.charAt(0).toUpperCase()}${activeColoring.slice(1)}Attribute`;
      activeComponents.push({ activeColoring, attributeType, getterKey, setterKey, key });
    }
    return activeComponents;
  }

  const currentColormap = computed((): string => {
    const targetId = dataIdRef.value;
    if (targetId === undefined || targetId === "") {
      return "batlow";
    }

    for (const comp of getActiveComponents(targetId)) {
      const getterName = `${comp.getterKey}${comp.attributeType}ColorMap`;
      const getter = getDynamicStoreMethod(dataStyleStore, getterName);
      if (getter) {
        const colorMap = getter(targetId);
        if (typeof colorMap === "string" && colorMap.length > 0) {
          return colorMap;
        }
      }
    }

    return "batlow";
  });

  async function applyCurrentRange(newValue: readonly [number, number]): Promise<void> {
    const targetId = dataIdRef.value;
    if (targetId === undefined || targetId === "") {
      return;
    }

    let updated = false;
    for (const comp of getActiveComponents(targetId)) {
      const setterName = `set${comp.setterKey}${comp.attributeType}Range`;
      const setter = getDynamicStoreMethod(dataStyleStore, setterName);
      if (setter) {
        setter(targetId, newValue[0], newValue[1]);
        updated = true;
      }
    }
    if (updated) {
      await hybridViewerStore.remoteRender();
    }
  }

  const currentRange = computed<readonly [number, number]>({
    get(): readonly [number, number] {
      const targetId = dataIdRef.value;
      if (targetId === undefined || targetId === "") {
        return [0, 1];
      }

      for (const comp of getActiveComponents(targetId)) {
        const getterName = `${comp.getterKey}${comp.attributeType}Range`;
        const getter = getDynamicStoreMethod(dataStyleStore, getterName);
        if (getter) {
          const rawRange = getter(targetId);
          const range = isNumberArray(rawRange) ? rawRange : undefined;
          if (range && range.length === 2) {
            return [range[0] ?? 0, range[1] ?? 1];
          }
        }
      }
      return [0, 1];
    },
    // Vue's WritableComputedOptions setter is strictly `(v: T) => void`, so the async render call is delegated to a helper (see the same trade-off in `app/composables/hover_highlight.ts`'s `onHoverEnter`).
    set: (newValue: readonly [number, number]): void => {
      /* oxlint-disable-next-line promise/prefer-await-to-then -- setter cannot be async; see comment above. */
      applyCurrentRange(newValue).catch(() => undefined);
    },
  });

  async function applyGlobalColormap(newMap: string): Promise<void> {
    const targetId = dataIdRef.value;
    if (targetId === undefined || targetId === "") {
      return;
    }

    const promises: Promise<unknown>[] = [];

    for (const comp of getActiveComponents(targetId)) {
      const setterName = `set${comp.setterKey}${comp.attributeType}ColorMap`;
      const setter = getDynamicStoreMethod(dataStyleStore, setterName);

      if (setter) {
        promises.push(Promise.resolve(setter(targetId, newMap)));
      }
    }

    await Promise.all(promises);
    await hybridViewerStore.remoteRender();
  }

  async function resetGlobalRange(): Promise<void> {
    const targetId = dataIdRef.value;
    if (targetId === undefined || targetId === "") {
      return;
    }

    const requestPromises: Promise<unknown>[] = [];

    for (const comp of getActiveComponents(targetId)) {
      const { activeColoring, attributeType, getterKey, setterKey } = comp;

      const nameGetter = getDynamicStoreMethod(dataStyleStore, `${getterKey}${attributeType}Name`);
      const itemGetter = getDynamicStoreMethod(dataStyleStore, `${getterKey}${attributeType}Item`);
      if (!nameGetter || !itemGetter) {
        continue;
      }

      const rawAttrName = nameGetter(targetId);
      const attrName = isStringOrUndefined(rawAttrName) ? rawAttrName : undefined;
      const rawAttrItem = itemGetter(targetId);
      const attrItem = (isNumberOrUndefined(rawAttrItem) ? rawAttrItem : undefined) ?? 0;

      if (attrName === undefined || attrName === "") {
        continue;
      }

      const schemaName = `${activeColoring}_attribute_names`;
      const backSchemas = back_schemas.opengeodeweb_back as Record<string, unknown>;
      const schema = backSchemas[schemaName];
      if (schema === undefined || !isJsonRpcSchema(schema)) {
        continue;
      }

      requestPromises.push(
        backStore.request(
          {
            schema,
            params: { id: targetId },
          },
          {
            response_function: async (response: unknown): Promise<void> => {
              if (!isAttributeResponse(response)) {
                return;
              }
              const attributes = response.attributes ?? [];
              const currentAttribute = attributes.find((attr) => attr.attribute_name === attrName);
              if (currentAttribute) {
                const { min, max } = getAttributeRange(currentAttribute, attrItem);

                const setterName = `set${setterKey}${attributeType}Range`;
                const setter = getDynamicStoreMethod(dataStyleStore, setterName);
                if (setter) {
                  setter(targetId, min, max);
                  await hybridViewerStore.remoteRender();
                }
              }
            },
          },
        ),
      );
    }

    await Promise.all(requestPromises);
  }

  return {
    currentColormap,
    currentRange,
    applyGlobalColormap,
    resetGlobalRange,
  };
}
