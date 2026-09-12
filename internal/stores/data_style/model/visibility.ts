import { MESH_COMPONENT_TYPES } from "@ogw_front/utils/default_styles";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useModelSelection } from "./selection";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// The four per-component-type style composables (Surface/Line/Block/Corner) each expose a
// different, large set of methods (color, visibility, per-attribute-kind getters/setters...).
// This module only cares about looking a handful of them up dynamically by name, so a precise
// structural type for componentStyleFunctions isn't worth modelling here; `any` keeps the
// dynamic dispatch table honest about that.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComponentStyleFunctions = Record<"Surface" | "Line" | "Block" | "Corner", any>;

interface ModelComponent {
  geode_id: string;
  type: string;
}

const model_schemas = viewer_schemas.opengeodeweb_viewer.model;
async function getModelComponentsMap(modelId: string) {
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
async function dispatchToComponentTypes(
  modelId: string,
  componentIds: string[],
  action: string,
  { componentStyleFunctions }: { componentStyleFunctions: ComponentStyleFunctions },
  ...args: unknown[]
) {
  const { componentsMap } = await getModelComponentsMap(modelId);
  const idsByComponent: { Block: string[]; Surface: string[]; Line: string[]; Corner: string[] } = {
    Block: [],
    Surface: [],
    Line: [],
    Corner: [],
  };
  for (const id of componentIds) {
    const type = componentsMap[id]?.type;
    if (type && type in idsByComponent) {
      (idsByComponent as Record<string, string[]>)[type]!.push(id);
    }
  }
  const promises: Promise<unknown>[] = [];
  if (action === "Visibility") {
    if (idsByComponent.Block.length > 0) {
      promises.push(
        componentStyleFunctions.Block.setModelBlocksVisibility(
          modelId,
          idsByComponent.Block,
          ...args,
        ),
      );
    }
    if (idsByComponent.Surface.length > 0) {
      promises.push(
        componentStyleFunctions.Surface.setModelSurfacesVisibility(
          modelId,
          idsByComponent.Surface,
          ...args,
        ),
      );
    }
    if (idsByComponent.Line.length > 0) {
      promises.push(
        componentStyleFunctions.Line.setModelLinesVisibility(modelId, idsByComponent.Line, ...args),
      );
    }
    if (idsByComponent.Corner.length > 0) {
      promises.push(
        componentStyleFunctions.Corner.setModelCornersVisibility(
          modelId,
          idsByComponent.Corner,
          ...args,
        ),
      );
    }
  } else if (action === "Color") {
    if (idsByComponent.Block.length > 0) {
      promises.push(
        componentStyleFunctions.Block.setModelBlocksColor(modelId, idsByComponent.Block, ...args),
      );
    }
    if (idsByComponent.Surface.length > 0) {
      promises.push(
        componentStyleFunctions.Surface.setModelSurfacesColor(
          modelId,
          idsByComponent.Surface,
          ...args,
        ),
      );
    }
    if (idsByComponent.Line.length > 0) {
      promises.push(
        componentStyleFunctions.Line.setModelLinesColor(modelId, idsByComponent.Line, ...args),
      );
    }
    if (idsByComponent.Corner.length > 0) {
      promises.push(
        componentStyleFunctions.Corner.setModelCornersColor(
          modelId,
          idsByComponent.Corner,
          ...args,
        ),
      );
    }
  }
  return Promise.all(promises);
}
// oxlint-disable-next-line max-lines-per-function
function useModelVisibilityStyle(componentStyleFunctions: ComponentStyleFunctions) {
  const dataStore = useDataStore();
  const dataStyleState = useDataStyleState();
  const hybridViewerStore = useHybridViewerStore();
  const viewerStore = useViewerStore();
  const modelCommonStyle = useModelCommonStyle();
  function modelVisibility(modelId: string): boolean | undefined {
    return dataStyleState.getStyle(modelId).visibility;
  }
  function setModelVisibility(modelId: string, visibility: boolean) {
    const schema = model_schemas.visibility;
    const params = {
      id: modelId,
      visibility,
    };
    return viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          await hybridViewerStore.setVisibility(modelId, visibility);
          await dataStyleState.mutateStyle(modelId, {
            visibility,
          });
          return {
            id: modelId,
            visibility,
          };
        },
      },
    );
  }
  async function setModelComponentTypeVisibility(
    modelId: string,
    componentType: string,
    visibility: boolean,
  ) {
    await modelCommonStyle.mutateModelComponentTypeStyle(modelId, componentType, {
      visibility,
    });
    const idsForType = await dataStore.getMeshComponentGeodeIds(modelId, componentType);
    if (idsForType.length === 0) {
      return;
    }
    await dispatchToComponentTypes(
      modelId,
      idsForType,
      "Visibility",
      {
        componentStyleFunctions,
      },
      visibility,
    );
  }
  async function setModelComponentsVisibility(
    modelId: string,
    componentIds: string[],
    visibility: boolean,
  ) {
    const typeIds = componentIds.filter((id) => MESH_COMPONENT_TYPES.includes(id));
    const individualIds = componentIds.filter((id) => !MESH_COMPONENT_TYPES.includes(id));
    const promises: Promise<unknown>[] = [];
    for (const typeId of typeIds) {
      promises.push(setModelComponentTypeVisibility(modelId, typeId, visibility));
    }
    if (individualIds.length > 0) {
      promises.push(
        dispatchToComponentTypes(
          modelId,
          individualIds,
          "Visibility",
          {
            componentStyleFunctions,
          },
          visibility,
        ),
      );
    }
    return await Promise.all(promises);
  }
  function modelComponentVisibility(modelId: string, componentId: string): boolean {
    const selection = useModelSelection(modelId, dataStyleState);
    return selection.value.includes(componentId);
  }
  function modelComponentTypeVisibility(modelId: string, componentType: string): boolean {
    const selection = useModelSelection(modelId, dataStyleState);
    return selection.value.includes(componentType);
  }
  return {
    modelVisibility,
    setModelVisibility,
    setModelComponentsVisibility,
    setModelComponentTypeVisibility,
    modelComponentVisibility,
    modelComponentTypeVisibility,
  };
}
export { getModelComponentsMap, dispatchToComponentTypes, useModelVisibilityStyle };
