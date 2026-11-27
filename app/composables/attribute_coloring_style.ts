import type {
  AttributeColorMap,
  AttributeTimeStep,
  AttributeTimeValue,
  ColoringType,
  ValidAttributeRange,
} from "@ogw_front/types/attribute";
import { type AttributeInfo, getAttributeRange } from "@ogw_front/utils/attributes";
import { type AttributeSchemas, fetchAttributeRange } from "@ogw_front/utils/attribute_range";
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import type { JsonRpcSchema } from "@ogw_shared/utils/types";
import type { ModelComponentId } from "@ogw_front/types/identifiers";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { useBackStore } from "@ogw_front/stores/back";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

// A style property of an attribute coloring, the suffix of its store methods ("Name", "Range", ...)
type StyleProperty = string;

// What the back schemas of an attribute coloring start with: "" for a data, "model_component_" for model components
type SchemaPrefix = string;

// Elements colored by the same attribute, with the store and back accesses of their data
interface AttributeColoring {
  // Reads a style property ("Name", "Range", ...) of the attribute coloring
  read: (property: StyleProperty) => unknown;
  write: (property: StyleProperty, ...values: unknown[]) => Promise<void>;
  schemas: AttributeSchemas;
  params: { id: DataId; component_ids?: ModelComponentId[] };
}

interface AttributeNamesResponse {
  attributes: Pick<AttributeInfo, "attribute_name" | "time_steps">[];
}

interface AttributeColoringStyle {
  currentColormap: ComputedRef<AttributeColorMap>;
  currentRange: WritableComputedRef<Readonly<ValidAttributeRange>>;
  applyGlobalColormap: (colorMap: AttributeColorMap) => Promise<void>;
  resetGlobalRange: () => Promise<void>;
  currentTimeSteps: Ref<AttributeTimeValue[]>;
  currentTimeStep: WritableComputedRef<AttributeTimeStep>;
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
function attributeType(activeColoring: ColoringType): string {
  return `${activeColoring.charAt(0).toUpperCase()}${activeColoring.slice(1)}Attribute`;
}

function attributeSchema(
  prefix: SchemaPrefix,
  activeColoring: ColoringType,
  route: string,
): JsonRpcSchema {
  const schema: unknown = Reflect.get(
    back_schemas.opengeodeweb_back,
    `${prefix}${activeColoring}_attribute_${route}`,
  );
  // oxlint-disable-next-line no-unsafe-type-assertion -- these schemas exist for every attribute coloring
  return schema as JsonRpcSchema;
}

// The `${prefix}${activeColoring}_attribute_names` and `_attribute_range` schemas
function attributeSchemas(prefix: SchemaPrefix, activeColoring: ColoringType): AttributeSchemas {
  return {
    names: attributeSchema(prefix, activeColoring, "names"),
    range: attributeSchema(prefix, activeColoring, "range"),
  };
}

// Colormap, range and time step of the attributes colored by a scalar bar
function useAttributeColoringStyle(colorings: Ref<AttributeColoring[]>): AttributeColoringStyle {
  const backStore = useBackStore();
  const hybridViewerStore = useHybridViewerStore();

  const currentTimeSteps = ref<AttributeTimeValue[]>([]);
  const temporalColoring = shallowRef<AttributeColoring | undefined>(undefined);

  async function writeAll(property: StyleProperty, ...values: unknown[]): Promise<void> {
    await Promise.all(
      colorings.value.map(async (coloring) => {
        await coloring.write(property, ...values);
      }),
    );
    await hybridViewerStore.remoteRender();
  }

  const currentColormap = computed((): AttributeColorMap => {
    const [coloring] = colorings.value;
    if (!coloring) {
      return "batlow";
    }
    return String(coloring.read("ColorMap"));
  });

  async function applyGlobalColormap(colorMap: AttributeColorMap): Promise<void> {
    await writeAll("ColorMap", colorMap);
  }

  const currentRange = computed<Readonly<ValidAttributeRange>>({
    get(): Readonly<ValidAttributeRange> {
      const [coloring] = colorings.value;
      if (!coloring) {
        return [0, 1];
      }
      // oxlint-disable-next-line no-unsafe-type-assertion -- the range getters return [minimum, maximum].
      const [minimum = 0, maximum = 1] = coloring.read("Range") as (number | undefined)[];
      return [minimum, maximum];
    },
    // Vue's WritableComputedOptions setter is strictly `(v: T) => void`: the async write is delegated.
    set: (range: Readonly<ValidAttributeRange>): void => {
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

  async function requestTimeSteps(coloring: AttributeColoring): Promise<AttributeTimeValue[]> {
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

  async function applyTimeStep(step: AttributeTimeStep): Promise<void> {
    if (temporalColoring.value) {
      await temporalColoring.value.write("TimeStep", step);
      await hybridViewerStore.remoteRender();
    }
  }

  const currentTimeStep = computed<AttributeTimeStep>({
    get(): AttributeTimeStep {
      const coloring = temporalColoring.value;
      if (!coloring) {
        return 0;
      }
      return Number(coloring.read("TimeStep") ?? 0);
    },
    // Setter cannot be async (see `currentRange`), so the write is delegated.
    set: (step: AttributeTimeStep): void => {
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
