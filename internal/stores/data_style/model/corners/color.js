import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useModelCornersCommonStyle } from "./common";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const schema = viewer_schemas.opengeodeweb_viewer.model.corners.color;

export function useModelCornersColor() {
  const modelCommonStyle = useModelCommonStyle();
  const modelCornersCommonStyle = useModelCornersCommonStyle();

  function modelCornerColor(id, corner_id) {
    return modelCornersCommonStyle.modelCornerStyle(id, corner_id).color;
  }

  function setModelCornersColor(modelId, corners_ids, color, color_mode = "constant") {
    return modelCommonStyle.setModelTypeColor(modelId, corners_ids, color, schema, color_mode);
  }

  function modelCornerColorMode(id, corner_id) {
    const mode = modelCornersCommonStyle.modelCornerStyle(id, corner_id).color_mode || "constant";
    return mode === "constant" ? "color" : mode;
  }

  function setModelCornerColorMode(modelId, corner_id, color_mode) {
    const dataStyleStore = useDataStyleStore();
    return dataStyleStore.setModelComponentColorMode(modelId, corner_id, color_mode);
  }

  return { setModelCornersColor, modelCornerColor, modelCornerColorMode, setModelCornerColorMode };
}
