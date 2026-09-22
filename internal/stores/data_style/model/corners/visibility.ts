import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useModelCornersCommonStyle } from "./common";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const schema = viewer_schemas.opengeodeweb_viewer.model.corners.visibility;

interface ModelCornersVisibilityApi {
  setModelCornersVisibility: (
    modelId: string,
    corners_ids: string[],
    visibility: boolean | undefined,
  ) => Promise<unknown>;
  modelCornerVisibility: (id: string, corner_id?: string) => unknown;
}

export function useModelCornersVisibility(): ModelCornersVisibilityApi {
  const modelCommonStyle = useModelCommonStyle();
  const modelCornersCommonStyle = useModelCornersCommonStyle();

  function modelCornerVisibility(id: string, corner_id?: string): unknown {
    return modelCornersCommonStyle.modelCornerStyle(id, corner_id).visibility;
  }

  async function setModelCornersVisibility(
    modelId: string,
    corners_ids: string[],
    visibility: boolean | undefined,
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
