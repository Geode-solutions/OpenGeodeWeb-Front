import { DEFAULT_MODEL_COMPONENT_TYPE_COLORS, MESH_TYPES } from "./constants";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelBlocksStyle } from "./blocks";
import { useModelColorStyle } from "./color";
import { useModelCornersStyle } from "./corners";
import { useModelEdgesStyle } from "./edges";
import { useModelLinesStyle } from "./lines";
import { useModelPointsStyle } from "./points";
import { useModelSelection } from "./selection";
import { useModelSurfacesStyle } from "./surfaces";
import { useModelVisibilityStyle } from "./visibility";
import { useViewerStore } from "@ogw_front/stores/viewer";

function useModelStyle() {
  const dataStore = useDataStore();
  const dataStyleState = useDataStyleState();
  const modelCornersStyleStore = useModelCornersStyle();
  const modelBlocksStyleStore = useModelBlocksStyle();
  const modelEdgesStyleStore = useModelEdgesStyle();
  const modelLinesStyleStore = useModelLinesStyle();
  const modelPointsStyleStore = useModelPointsStyle();
  const modelSurfacesStyleStore = useModelSurfacesStyle();
  const viewerStore = useViewerStore();

  const stores = {
    Corner: modelCornersStyleStore,
    Line: modelLinesStyleStore,
    Surface: modelSurfacesStyleStore,
    Block: modelBlocksStyleStore,
  };

  const modelColorStyle = useModelColorStyle(stores);
  const modelVisibilityStyle = useModelVisibilityStyle(stores);

  function visibleMeshComponents(id_ref) {
    return useModelSelection(id_ref, dataStyleState);
  }

  function applyModelStyle(modelId) {
    const style = dataStyleState.getStyle(modelId);

    return Promise.all([
      modelVisibilityStyle.setModelVisibility(modelId, style.visibility),
      modelBlocksStyleStore.applyModelBlocksStyle(modelId),
      modelSurfacesStyleStore.applyModelSurfacesStyle(modelId),
      modelLinesStyleStore.applyModelLinesStyle(modelId),
      modelCornersStyleStore.applyModelCornersStyle(modelId),
      modelPointsStyleStore.applyModelPointsStyle(modelId),
      modelEdgesStyleStore.applyModelEdgesStyle(modelId),
    ]);
  }

  async function setModelMeshComponentsDefaultStyle(modelId) {
    viewerStore.start_request();
    try {
      const item = await dataStore.item(modelId);
      if (!item) {
        return;
      }
      return await Promise.all([
        modelBlocksStyleStore.setModelBlocksDefaultStyle(modelId),
        modelSurfacesStyleStore.setModelSurfacesDefaultStyle(modelId),
        modelLinesStyleStore.setModelLinesDefaultStyle(modelId),
        modelCornersStyleStore.setModelCornersDefaultStyle(modelId),
      ]);
    } finally {
      viewerStore.stop_request();
    }
  }

  return {
    visibleMeshComponents,
    applyModelStyle,
    setModelMeshComponentsDefaultStyle,
    ...modelColorStyle,
    ...modelVisibilityStyle,
    ...modelBlocksStyleStore,
    ...modelCornersStyleStore,
    ...modelEdgesStyleStore,
    ...modelLinesStyleStore,
    ...modelPointsStyleStore,
    ...modelSurfacesStyleStore,
  };
}

export { MESH_TYPES, DEFAULT_MODEL_COMPONENT_TYPE_COLORS, useModelStyle };
