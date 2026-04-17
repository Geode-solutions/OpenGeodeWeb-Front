import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useModelCornersCommonStyle } from "./common";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const schema = viewer_schemas.opengeodeweb_viewer.model.corners.color;

export function useModelCornersColor() {
  const modelCommonStyle = useModelCommonStyle();
  const modelCornersCommonStyle = useModelCornersCommonStyle();

  function modelCornerColor(id, corner_id) {
    return modelCornersCommonStyle.modelCornerStyle(id, corner_id).color;
  }

  function setModelCornersColor(modelId, componentIds, color, color_mode = "constant") {
    return modelCommonStyle.setModelTypeColor(modelId, componentIds, color, schema, color_mode);
  }

  return { setModelCornersColor, modelCornerColor };
}
