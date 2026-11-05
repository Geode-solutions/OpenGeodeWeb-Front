import { MESH_COMPONENT_TYPES } from "@ogw_front/utils/default_styles";
import { useDataStore } from "@ogw_front/stores/data";

// The four per-component-type style composables (Surface/Line/Block/Corner) each expose a different, large set of methods (color, visibility, per-attribute-kind getters/setters...). This module only cares about looking a handful of them up dynamically by name, so a precise structural type for componentStyleFunctions isn't worth modelling here; `any` keeps the dynamic dispatch table honest about that.
// oxlint-disable-next-line no-explicit-any
type ComponentStyleFunctions = Record<"Surface" | "Line" | "Block" | "Corner", any>;

interface ModelComponent {
  geode_id: string;
  type: string;
}

async function callComponentStyleFunction(
  // oxlint-disable-next-line no-explicit-any
  target: any,
  method: string,
  ...args: unknown[]
): Promise<unknown> {
  // oxlint-disable-next-line no-unsafe-call, no-unsafe-member-access, no-unsafe-argument, no-unsafe-assignment -- ComponentStyleFunctions is deliberately dynamically typed; see comment above.
  const result = await target[method](...args);
  return result;
}

async function getModelComponentsMap(
  modelId: string,
): Promise<{ allComponents: ModelComponent[]; componentsMap: Record<string, ModelComponent> }> {
  const dataStore = useDataStore();
  const results = await Promise.all(
    MESH_COMPONENT_TYPES.map(async (type) => {
      const geodeIds = await dataStore.getMeshComponentGeodeIds(modelId, type);
      return geodeIds.map((geode_id): ModelComponent => ({
        geode_id,
        type,
      }));
    }),
  );
  const allComponents = results.flat();
  return {
    allComponents,
    componentsMap: Object.fromEntries(
      allComponents.map((component): [string, ModelComponent] => [component.geode_id, component]),
    ),
  };
}
const COMPONENT_TYPE_NAMES = ["Block", "Surface", "Line", "Corner"] as const;
type ComponentTypeName = (typeof COMPONENT_TYPE_NAMES)[number];

const DISPATCH_METHODS: Partial<Record<string, Record<ComponentTypeName, string>>> = {
  Visibility: {
    Block: "setModelBlocksVisibility",
    Surface: "setModelSurfacesVisibility",
    Line: "setModelLinesVisibility",
    Corner: "setModelCornersVisibility",
  },
  Color: {
    Block: "setModelBlocksColor",
    Surface: "setModelSurfacesColor",
    Line: "setModelLinesColor",
    Corner: "setModelCornersColor",
  },
};

function groupIdsByComponentType(
  componentIds: string[],
  componentsMap: Record<string, ModelComponent>,
): Record<ComponentTypeName, string[]> {
  const idsByComponent: Record<ComponentTypeName, string[]> = {
    Block: [],
    Surface: [],
    Line: [],
    Corner: [],
  };
  for (const id of componentIds) {
    const type = componentsMap[id]?.type;
    if (type !== undefined && type in idsByComponent) {
      (idsByComponent as Record<string, string[]>)[type]?.push(id);
    }
  }
  return idsByComponent;
}

async function dispatchToComponentTypes(
  modelId: string,
  componentIds: string[],
  action: string,
  { componentStyleFunctions }: { componentStyleFunctions: ComponentStyleFunctions },
  ...args: unknown[]
): Promise<unknown[]> {
  const { componentsMap } = await getModelComponentsMap(modelId);
  const idsByComponent = groupIdsByComponentType(componentIds, componentsMap);
  const methods = DISPATCH_METHODS[action];
  if (methods === undefined) {
    return [];
  }
  const promises = COMPONENT_TYPE_NAMES.filter((type) => idsByComponent[type].length > 0).map(
    async (type) => {
      const result = await callComponentStyleFunction(
        componentStyleFunctions[type],
        methods[type],
        modelId,
        idsByComponent[type],
        ...args,
      );
      return result;
    },
  );
  return Promise.all(promises);
}
export { getModelComponentsMap, dispatchToComponentTypes };
export type { ComponentStyleFunctions };
