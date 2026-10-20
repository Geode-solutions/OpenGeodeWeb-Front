import {
  ATTRIBUTE_COLORINGS,
  type ActiveComponent,
  type ModelComponent,
  attributeParams,
  attributeSchema,
  attributeTypeOf,
  meshActiveComponents,
} from "@ogw_front/utils/global_attribute_components";
import type { JsonRpcSchema } from "@ogw_shared/utils/types";
import { fetchAttributeRange } from "@ogw_front/utils/attribute_range";
import { getAttributeRange } from "@ogw_front/utils/attributes";
import { useBackStore } from "@ogw_front/stores/back";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

// This composable resolves a batch of dynamically-named getter/setter methods on the data style store (e.g. "meshPointsVertexAttributeRange", "setMeshPointsVertexAttributeRange", ...) - the store's real, fully-typed surface has no index signature for this, so dynamic lookups go through this type guard instead of an unsafe cast of the whole store (which mixes these methods with state refs and other members), matching how these methods are actually shaped (getters take an id and return a value, setters take an id plus arbitrary arguments).
type DynamicStoreMethod = (...args: readonly unknown[]) => unknown;

function isDynamicStoreMethod(value: unknown): value is DynamicStoreMethod {
  return typeof value === "function";
}

function getDynamicStoreMethod(store: object, key: string): DynamicStoreMethod | undefined {
  const value: unknown = Reflect.get(store, key);
  return isDynamicStoreMethod(value) ? value : undefined;
}

interface AttributeResponse {
  readonly attributes?: readonly {
    readonly attribute_name?: string;
    readonly time_steps?: readonly number[];
  }[];
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

export function useGlobalAttributeStyle(
  dataIdRef: Ref<string | undefined>,
  componentViewerIdsRef: Ref<number[] | undefined> = ref<number[] | undefined>(undefined),
): {
  currentColormap: typeof currentColormap;
  currentRange: typeof currentRange;
  applyGlobalColormap: typeof applyGlobalColormap;
  resetGlobalRange: typeof resetGlobalRange;
  currentTimeSteps: typeof currentTimeSteps;
  currentTimeStep: typeof currentTimeStep;
  loadTimeSteps: typeof loadTimeSteps;
} {
  const dataStyleStore = useDataStyleStore();
  const dataStore = useDataStore();
  const hybridViewerStore = useHybridViewerStore();
  const backStore = useBackStore();

  // Components of the model colored by the picked scalar bar, empty for a mesh
  const modelComponents = shallowRef<ModelComponent[]>([]);

  async function resolveModelComponents(): Promise<void> {
    const modelId = dataIdRef.value;
    const viewerIds = componentViewerIdsRef.value ?? [];
    if (modelId === undefined || modelId === "" || viewerIds.length === 0) {
      modelComponents.value = [];
      return;
    }
    const components = await Promise.all(
      viewerIds.map(async (viewerId) => {
        const component = await dataStore.getComponentByViewerId(modelId, viewerId);
        return component;
      }),
    );
    modelComponents.value = components
      .filter((component) => component !== undefined)
      .map((component) => ({ type: component.type, geodeId: component.geode_id }));
  }

  // Groups the model components by type and active coloring: each group uses the same store methods
  function getModelActiveComponents(modelId: string): ActiveComponent[] {
    const groups = new Map<string, ActiveComponent>();
    for (const { type, geodeId } of modelComponents.value) {
      const coloringGetter = getDynamicStoreMethod(dataStyleStore, `model${type}ActiveColoring`);
      const activeColoring = coloringGetter?.(modelId, geodeId);
      if (typeof activeColoring !== "string" || !ATTRIBUTE_COLORINGS.has(activeColoring)) {
        continue;
      }
      const key = `${type}_${activeColoring}`;
      const group = groups.get(key) ?? {
        activeColoring,
        attributeType: attributeTypeOf(activeColoring),
        getterKey: `model${type}s`,
        setterKey: `Model${type}s`,
        key,
        componentIds: [],
      };
      group.componentIds?.push(geodeId);
      groups.set(key, group);
    }
    return [...groups.values()];
  }

  function getActiveComponents(targetId: string): ActiveComponent[] {
    return modelComponents.value.length > 0
      ? getModelActiveComponents(targetId)
      : meshActiveComponents(dataStyleStore.getStyle(targetId));
  }

  // Mesh getters take the data id, model getters also take one of the component ids
  function readStyle(targetId: string, comp: ActiveComponent, property: string): unknown {
    const getter = getDynamicStoreMethod(
      dataStyleStore,
      `${comp.getterKey}${comp.attributeType}${property}`,
    );
    if (!getter) {
      return undefined;
    }
    return comp.componentIds ? getter(targetId, comp.componentIds[0]) : getter(targetId);
  }

  // Mesh setters take the data id, model setters also take the component ids. False if no setter.
  async function writeStyle(
    targetId: string,
    comp: ActiveComponent,
    property: string,
    ...values: unknown[]
  ): Promise<boolean> {
    const setter = getDynamicStoreMethod(
      dataStyleStore,
      `set${comp.setterKey}${comp.attributeType}${property}`,
    );
    if (!setter) {
      return false;
    }
    await (comp.componentIds
      ? setter(targetId, comp.componentIds, ...values)
      : setter(targetId, ...values));
    return true;
  }

  const currentColormap = computed((): string => {
    const targetId = dataIdRef.value;
    if (targetId === undefined || targetId === "") {
      return "batlow";
    }

    for (const comp of getActiveComponents(targetId)) {
      const colorMap = readStyle(targetId, comp, "ColorMap");
      if (typeof colorMap === "string" && colorMap.length > 0) {
        return colorMap;
      }
    }

    return "batlow";
  });

  async function applyCurrentRange(newValue: readonly [number, number]): Promise<void> {
    const targetId = dataIdRef.value;
    if (targetId === undefined || targetId === "") {
      return;
    }

    const written = await Promise.all(
      getActiveComponents(targetId).map(async (comp) => {
        const componentWritten = await writeStyle(
          targetId,
          comp,
          "Range",
          newValue[0],
          newValue[1],
        );
        return componentWritten;
      }),
    );
    if (written.includes(true)) {
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
        const rawRange = readStyle(targetId, comp, "Range");
        const range = isNumberArray(rawRange) ? rawRange : undefined;
        if (range && range.length === 2) {
          return [range[0] ?? 0, range[1] ?? 1];
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

    await Promise.all(
      getActiveComponents(targetId).map(async (comp) => {
        await writeStyle(targetId, comp, "ColorMap", newMap);
      }),
    );
    await hybridViewerStore.remoteRender();
  }

  async function resetGlobalRange(): Promise<void> {
    const targetId = dataIdRef.value;
    if (targetId === undefined || targetId === "") {
      return;
    }

    const requestPromises: Promise<unknown>[] = [];

    for (const comp of getActiveComponents(targetId)) {
      const rawAttrName = readStyle(targetId, comp, "Name");
      const attrName = isStringOrUndefined(rawAttrName) ? rawAttrName : undefined;
      const rawAttrItem = readStyle(targetId, comp, "Item");
      const attrItem = (isNumberOrUndefined(rawAttrItem) ? rawAttrItem : undefined) ?? 0;

      if (attrName === undefined || attrName === "") {
        continue;
      }

      const rangeSchema = attributeSchema(comp, "range");
      if (!isJsonRpcSchema(rangeSchema)) {
        continue;
      }

      requestPromises.push(
        (async (): Promise<void> => {
          const range = await fetchAttributeRange(
            rangeSchema,
            attributeParams(targetId, comp),
            attrName,
          );
          if (!range) {
            return;
          }
          const { min, max } = getAttributeRange(range, attrItem);
          if (await writeStyle(targetId, comp, "Range", min, max)) {
            await hybridViewerStore.remoteRender();
          }
        })(),
      );
    }

    await Promise.all(requestPromises);
  }

  const currentTimeSteps = ref<number[]>([]);
  const temporalComponent = shallowRef<ActiveComponent | undefined>(undefined);

  async function requestTimeSteps(targetId: string, comp: ActiveComponent): Promise<number[]> {
    const rawAttrName = readStyle(targetId, comp, "Name");
    const schema = attributeSchema(comp, "names");
    if (
      !isStringOrUndefined(rawAttrName) ||
      rawAttrName === undefined ||
      rawAttrName === "" ||
      !isJsonRpcSchema(schema)
    ) {
      return [];
    }
    let timeSteps: number[] = [];
    await backStore.request(
      { schema, params: attributeParams(targetId, comp) },
      {
        response_function: (response: unknown): void => {
          if (!isAttributeResponse(response)) {
            return;
          }
          const found = response.attributes?.find((attr) => attr.attribute_name === rawAttrName);
          timeSteps = [...(found?.time_steps ?? [])];
        },
      },
    );
    return timeSteps;
  }

  async function loadTimeSteps(): Promise<void> {
    const targetId = dataIdRef.value;
    temporalComponent.value = undefined;
    currentTimeSteps.value = [];
    if (targetId === undefined || targetId === "") {
      return;
    }
    for (const comp of getActiveComponents(targetId)) {
      // oxlint-disable-next-line no-await-in-loop -- first temporal component wins, in order.
      const timeSteps = await requestTimeSteps(targetId, comp);
      if (timeSteps.length > 0) {
        temporalComponent.value = comp;
        currentTimeSteps.value = timeSteps;
        return;
      }
    }
  }

  watch(
    [dataIdRef, componentViewerIdsRef],
    async () => {
      await resolveModelComponents();
      await loadTimeSteps();
    },
    { immediate: true },
  );

  async function applyCurrentTimeStep(step: number): Promise<void> {
    const targetId = dataIdRef.value;
    const comp = temporalComponent.value;
    if (targetId === undefined || targetId === "" || !comp) {
      return;
    }
    if (await writeStyle(targetId, comp, "TimeStep", step)) {
      await hybridViewerStore.remoteRender();
    }
  }

  const currentTimeStep = computed<number>({
    get(): number {
      const targetId = dataIdRef.value;
      const comp = temporalComponent.value;
      if (targetId === undefined || targetId === "" || !comp) {
        return 0;
      }
      const rawStep = readStyle(targetId, comp, "TimeStep");
      return typeof rawStep === "number" ? rawStep : 0;
    },
    // Setter cannot be async (see `currentRange`), so the work is delegated to a helper.
    set: (step: number): void => {
      /* oxlint-disable-next-line promise/prefer-await-to-then -- setter cannot be async; see comment above. */
      applyCurrentTimeStep(step).catch(() => undefined);
    },
  });

  return {
    currentColormap,
    currentRange,
    applyGlobalColormap,
    resetGlobalRange,
    currentTimeSteps,
    currentTimeStep,
    loadTimeSteps,
  };
}
