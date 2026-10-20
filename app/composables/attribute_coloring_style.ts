import { type AttributeSchemas, fetchAttributeRange } from "@ogw_front/utils/attribute_range";
import type { JsonRpcSchema } from "@ogw_shared/utils/types";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { getAttributeRange } from "@ogw_front/utils/attributes";
import { useBackStore } from "@ogw_front/stores/back";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

// Elements colored by the same attribute, with the store and back accesses of their data
interface AttributeColoring {
  // Reads a style property ("Name", "Range", ...) of the attribute coloring
  read: (property: string) => unknown;
  write: (property: string, ...values: unknown[]) => Promise<void>;
  schemas: AttributeSchemas;
  params: { id: string; component_ids?: string[] };
}

interface AttributeNamesResponse {
  attributes: { attribute_name: string; time_steps?: number[] }[];
}

interface AttributeColoringStyle {
  currentColormap: ComputedRef<string>;
  currentRange: WritableComputedRef<readonly [number, number]>;
  applyGlobalColormap: (colorMap: string) => Promise<void>;
  resetGlobalRange: () => Promise<void>;
  currentTimeSteps: Ref<number[]>;
  currentTimeStep: WritableComputedRef<number>;
  loadTimeSteps: () => Promise<void>;
}

type StoreMethod = (...args: readonly unknown[]) => unknown;

// The data style store methods are named after the element and attribute types, e.g. "meshPointsVertexAttributeRange"
function storeMethod(store: object, name: string): StoreMethod {
  const method: unknown = Reflect.get(store, name);
  // oxlint-disable-next-line no-unsafe-type-assertion -- the style methods exist for every element type and attribute coloring
  return method as StoreMethod;
}

// "Polyhedron" in the store method names of the "polyhedron" coloring
function attributeType(activeColoring: string): string {
  return `${activeColoring.charAt(0).toUpperCase()}${activeColoring.slice(1)}Attribute`;
}

function attributeSchema(prefix: string, activeColoring: string, route: string): JsonRpcSchema {
  const schema: unknown = Reflect.get(
    back_schemas.opengeodeweb_back,
    `${prefix}${activeColoring}_attribute_${route}`,
  );
  // oxlint-disable-next-line no-unsafe-type-assertion -- these schemas exist for every attribute coloring
  return schema as JsonRpcSchema;
}

// The `${prefix}${activeColoring}_attribute_names` and `_attribute_range` schemas
function attributeSchemas(prefix: string, activeColoring: string): AttributeSchemas {
  return {
    names: attributeSchema(prefix, activeColoring, "names"),
    range: attributeSchema(prefix, activeColoring, "range"),
  };
}

// Colormap, range and time step of the attributes colored by a scalar bar
function useAttributeColoringStyle(colorings: Ref<AttributeColoring[]>): AttributeColoringStyle {
  const backStore = useBackStore();
  const hybridViewerStore = useHybridViewerStore();

  const currentTimeSteps = ref<number[]>([]);
  const temporalColoring = shallowRef<AttributeColoring | undefined>(undefined);

  async function writeAll(property: string, ...values: unknown[]): Promise<void> {
    await Promise.all(
      colorings.value.map(async (coloring) => {
        await coloring.write(property, ...values);
      }),
    );
    await hybridViewerStore.remoteRender();
  }

  const currentColormap = computed((): string => {
    const [coloring] = colorings.value;
    return coloring ? String(coloring.read("ColorMap")) : "batlow";
  });

  async function applyGlobalColormap(colorMap: string): Promise<void> {
    await writeAll("ColorMap", colorMap);
  }

  const currentRange = computed<readonly [number, number]>({
    get(): readonly [number, number] {
      const [coloring] = colorings.value;
      if (!coloring) {
        return [0, 1];
      }
      // oxlint-disable-next-line no-unsafe-type-assertion -- the range getters return [minimum, maximum].
      const [minimum = 0, maximum = 1] = coloring.read("Range") as (number | undefined)[];
      return [minimum, maximum];
    },
    // Vue's WritableComputedOptions setter is strictly `(v: T) => void`: the async write is delegated.
    set: (range: readonly [number, number]): void => {
      /* oxlint-disable-next-line promise/prefer-await-to-then -- setter cannot be async; see comment above. */
      writeAll("Range", range[0], range[1]).catch(() => undefined);
    },
  });

  async function resetGlobalRange(): Promise<void> {
    await Promise.all(
      colorings.value.map(async (coloring) => {
        const range = await fetchAttributeRange(
          coloring.schemas.range,
          coloring.params,
          String(coloring.read("Name")),
        );
        const { min, max } = getAttributeRange(range, Number(coloring.read("Item") ?? 0));
        await coloring.write("Range", min, max);
      }),
    );
    await hybridViewerStore.remoteRender();
  }

  async function requestTimeSteps(coloring: AttributeColoring): Promise<number[]> {
    const name = coloring.read("Name");
    const response = await backStore.request({
      schema: coloring.schemas.names,
      params: coloring.params,
    });
    // oxlint-disable-next-line no-unsafe-type-assertion -- every *_attribute_names schema shares this response.
    const { attributes } = response as AttributeNamesResponse;
    return attributes.find((attribute) => attribute.attribute_name === name)?.time_steps ?? [];
  }

  async function loadTimeSteps(): Promise<void> {
    temporalColoring.value = undefined;
    currentTimeSteps.value = [];
    for (const coloring of colorings.value) {
      // oxlint-disable-next-line no-await-in-loop -- first temporal coloring wins, in order.
      const timeSteps = await requestTimeSteps(coloring);
      if (timeSteps.length > 0) {
        temporalColoring.value = coloring;
        currentTimeSteps.value = timeSteps;
        return;
      }
    }
  }

  async function applyTimeStep(step: number): Promise<void> {
    if (temporalColoring.value) {
      await temporalColoring.value.write("TimeStep", step);
      await hybridViewerStore.remoteRender();
    }
  }

  const currentTimeStep = computed<number>({
    get(): number {
      const coloring = temporalColoring.value;
      return coloring ? Number(coloring.read("TimeStep") ?? 0) : 0;
    },
    // Setter cannot be async (see `currentRange`), so the write is delegated.
    set: (step: number): void => {
      /* oxlint-disable-next-line promise/prefer-await-to-then -- setter cannot be async; see comment above. */
      applyTimeStep(step).catch(() => undefined);
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

export {
  type AttributeColoring,
  type AttributeColoringStyle,
  attributeSchemas,
  attributeType,
  storeMethod,
  useAttributeColoringStyle,
};
