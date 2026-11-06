import type { CornerId, ModelId } from "@ogw_front/types/identifiers";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useModelCornersCommonStyle } from "./common";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

const schema = viewer_schemas.opengeodeweb_viewer.model.corners.visibility;

interface ModelCornersVisibilityApi {
  setModelCornersVisibility: (
    modelId: ModelId,
    corners_ids: CornerId[],
    visibility: boolean,
  ) => Promise<unknown>;
  modelCornerVisibility: (modelId: ModelId, corner_id?: CornerId) => unknown;
}

export function useModelCornersVisibility(): ModelCornersVisibilityApi {
  const modelCommonStyle = useModelCommonStyle();
  const modelCornersCommonStyle = useModelCornersCommonStyle();

  function modelCornerVisibility(modelId: ModelId, corner_id?: CornerId): unknown {
    return modelCornersCommonStyle.modelCornerStyle(modelId, corner_id).visibility;
  }

  async function setModelCornersVisibility(
    modelId: ModelId,
    corners_ids: CornerId[],
    visibility: boolean,
  ): Promise<unknown> {
    const result = await modelCommonStyle.setModelTypeVisibility(
      modelId,
      corners_ids,
      visibility,
      schema,
    );
    return result;
  }

  return { setModelCornersVisibility, modelCornerVisibility };
}
