import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useModelCornersCommonStyle } from "./common";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const schema = viewer_schemas.opengeodeweb_viewer.model.corners.visibility;

export function useModelCornersVisibility() {
  const modelCommonStyle = useModelCommonStyle();
  const modelCornersCommonStyle = useModelCornersCommonStyle();

  function modelCornerVisibility(id, corner_id) {
    return modelCornersCommonStyle.modelCornerStyle(id, corner_id).visibility;
  }

  function setModelCornersVisibility(modelId, componentIds, visibility) {
    return modelCommonStyle.setModelTypeVisibility(modelId, componentIds, visibility, schema);
  }

  return { setModelCornersVisibility, modelCornerVisibility };
}
