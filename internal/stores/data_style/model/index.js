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
  const modelCornersStyle = useModelCornersStyle();
  const modelBlocksStyle = useModelBlocksStyle();
  const modelEdgesStyle = useModelEdgesStyle();
  const modelLinesStyle = useModelLinesStyle();
  const modelPointsStyle = useModelPointsStyle();
  const modelSurfacesStyle = useModelSurfacesStyle();
  const viewerStore = useViewerStore();

  const componentStyleFunctions = {
    Corner: modelCornersStyle,
    Line: modelLinesStyle,
    Surface: modelSurfacesStyle,
    Block: modelBlocksStyle,
  };

  const modelColorStyle = useModelColorStyle(componentStyleFunctions);
  const modelVisibilityStyle = useModelVisibilityStyle(componentStyleFunctions);

  function visibleMeshComponents(id_ref) {
    return useModelSelection(id_ref, dataStyleState);
  }

  function applyModelStyle(modelId) {
    const style = dataStyleState.getStyle(modelId);

    return Promise.all([
      modelVisibilityStyle.setModelVisibility(modelId, style.visibility),
      modelBlocksStyle.applyModelBlocksStyle(modelId),
      modelSurfacesStyle.applyModelSurfacesStyle(modelId),
      modelLinesStyle.applyModelLinesStyle(modelId),
      modelCornersStyle.applyModelCornersStyle(modelId),
      modelPointsStyle.applyModelPointsStyle(modelId),
      modelEdgesStyle.applyModelEdgesStyle(modelId),
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
        modelBlocksStyle.setModelBlocksDefaultStyle(modelId),
        modelSurfacesStyle.setModelSurfacesDefaultStyle(modelId),
        modelLinesStyle.setModelLinesDefaultStyle(modelId),
        modelCornersStyle.setModelCornersDefaultStyle(modelId),
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
    ...modelBlocksStyle,
    ...modelCornersStyle,
    ...modelEdgesStyle,
    ...modelLinesStyle,
    ...modelPointsStyle,
    ...modelSurfacesStyle,
  };
}

export { useModelStyle };
