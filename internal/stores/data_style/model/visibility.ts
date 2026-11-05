import { type ComponentStyleFunctions, dispatchToComponentTypes } from "./visibility_dispatch";
import { MESH_COMPONENT_TYPES } from "@ogw_front/utils/default_styles";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useModelSelection } from "./selection";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

const model_schemas = viewer_schemas.opengeodeweb_viewer.model;
interface UseModelVisibilityStyleReturn {
  modelVisibility: (modelId: string) => boolean | undefined;
  setModelVisibility: (modelId: string, visibility: boolean) => Promise<unknown>;
  setModelComponentsVisibility: (
    modelId: string,
    componentIds: string[],
    visibility: boolean,
  ) => Promise<unknown[]>;
  setModelComponentTypeVisibility: (
    modelId: string,
    componentType: string,
    visibility: boolean,
  ) => Promise<void>;
  modelComponentVisibility: (modelId: string, componentId: string) => boolean;
  modelComponentTypeVisibility: (modelId: string, componentType: string) => boolean;
}

// oxlint-disable-next-line max-lines-per-function
function useModelVisibilityStyle(
  componentStyleFunctions: ComponentStyleFunctions,
): UseModelVisibilityStyleReturn {
  const dataStore = useDataStore();
  const dataStyleState = useDataStyleState();
  const hybridViewerStore = useHybridViewerStore();
  const viewerStore = useViewerStore();
  const modelCommonStyle = useModelCommonStyle();
  function modelVisibility(modelId: string): boolean | undefined {
    return dataStyleState.getStyle(modelId).visibility;
  }
  async function setModelVisibility(modelId: string, visibility: boolean): Promise<unknown> {
    const schema = model_schemas.visibility;
    const params = {
      id: modelId,
      visibility,
    };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          hybridViewerStore.setVisibility(modelId, visibility);
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
    return result;
  }
  async function setModelComponentTypeVisibility(
    modelId: string,
    componentType: string,
    visibility: boolean,
  ): Promise<void> {
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
  ): Promise<unknown[]> {
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
    const results = await Promise.all(promises);
    return results;
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
export { useModelVisibilityStyle };
export { getModelComponentsMap, dispatchToComponentTypes } from "./visibility_dispatch";
