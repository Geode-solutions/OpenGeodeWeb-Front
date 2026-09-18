import type { ComputedRef } from "vue";
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
    visibleMeshComponents: (modelId: string) => ComputedRef<string[]>;
    applyModelStyle: (modelId: string) => Promise<unknown[]>;
    setModelMeshComponentsDefaultStyle: (modelId: string) => Promise<unknown[]>;
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

  function visibleMeshComponents(modelId: string): ComputedRef<string[]> {
    return useModelSelection(modelId, dataStyleState);
  }

  async function applyModelStyle(modelId: string): Promise<unknown[]> {
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
    return results;
  }

  async function setModelMeshComponentsDefaultStyle(modelId: string): Promise<unknown[]> {
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
