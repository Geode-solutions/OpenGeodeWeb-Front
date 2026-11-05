import type { ComputedRef } from "vue";
import type { DataId } from "@ogw_front/types/identifiers";
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

type UseModelStyleReturn = ReturnType<typeof useModelColorStyle> &
  ReturnType<typeof useModelVisibilityStyle> &
  ReturnType<typeof useModelBlocksStyle> &
  ReturnType<typeof useModelCornersStyle> &
  ReturnType<typeof useModelEdgesStyle> &
  ReturnType<typeof useModelLinesStyle> &
  ReturnType<typeof useModelPointsStyle> &
  ReturnType<typeof useModelSurfacesStyle> & {
    visibleMeshComponents: (modelId: DataId) => ComputedRef<string[]>;
    applyModelStyle: (modelId: DataId) => Promise<unknown[]>;
    setModelMeshComponentsDefaultStyle: (modelId: DataId) => Promise<unknown[]>;
  };

// oxlint-disable-next-line max-lines-per-function, max-statements
function useModelStyle(): UseModelStyleReturn {
  const dataStore = useDataStore();
  const dataStyleState = useDataStyleState();
  const modelCornersStyle = useModelCornersStyle();
  const modelBlocksStyle = useModelBlocksStyle();
  const modelEdgesStyle = useModelEdgesStyle();
  const modelLinesStyle = useModelLinesStyle();
  const modelPointsStyle = useModelPointsStyle();
  const modelSurfacesStyle = useModelSurfacesStyle();

  const componentStyleFunctions = {
    Corner: modelCornersStyle,
    Line: modelLinesStyle,
    Surface: modelSurfacesStyle,
    Block: modelBlocksStyle,
  };

  const modelColorStyle = useModelColorStyle(componentStyleFunctions);
  const modelVisibilityStyle = useModelVisibilityStyle(componentStyleFunctions);

  function visibleMeshComponents(modelId: DataId): ComputedRef<string[]> {
    return useModelSelection(modelId, dataStyleState);
  }

  async function applyModelStyle(modelId: DataId): Promise<unknown[]> {
    const style = dataStyleState.getStyle(modelId);

    const results = await Promise.all([
      modelVisibilityStyle.setModelVisibility(modelId, style.visibility ?? false),
      modelBlocksStyle.applyModelBlocksStyle(modelId),
      modelSurfacesStyle.applyModelSurfacesStyle(modelId),
      modelLinesStyle.applyModelLinesStyle(modelId),
      modelCornersStyle.applyModelCornersStyle(modelId),
      modelPointsStyle.applyModelPointsStyle(modelId),
      modelEdgesStyle.applyModelEdgesStyle(modelId),
    ]);
    // Components points and edges come after the model ones, which override every component
    await Promise.all([
      modelSurfacesStyle.applyModelSurfacesPointsStyle(modelId),
      modelLinesStyle.applyModelLinesPointsStyle(modelId),
      modelBlocksStyle.applyModelBlocksPointsStyle(modelId),
      modelSurfacesStyle.applyModelSurfacesEdgesStyle(modelId),
      modelBlocksStyle.applyModelBlocksEdgesStyle(modelId),
    ]);
    return results;
  }

  async function setModelMeshComponentsDefaultStyle(modelId: DataId): Promise<unknown[]> {
    await dataStore.item(modelId);
    const results = await Promise.all([
      modelBlocksStyle.setModelBlocksDefaultStyle(modelId),
      modelSurfacesStyle.setModelSurfacesDefaultStyle(modelId),
      modelLinesStyle.setModelLinesDefaultStyle(modelId),
      modelCornersStyle.setModelCornersDefaultStyle(modelId),
    ]);
    return results;
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
