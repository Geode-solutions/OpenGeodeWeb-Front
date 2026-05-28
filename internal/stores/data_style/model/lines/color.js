import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useModelLinesCommonStyle } from "./common";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const schema = viewer_schemas.opengeodeweb_viewer.model.lines.color;

export function useModelLinesColor() {
  const modelCommonStyle = useModelCommonStyle();
  const modelLinesCommonStyle = useModelLinesCommonStyle();

  function modelLineColor(id, line_id) {
    return modelLinesCommonStyle.modelLineStyle(id, line_id).color;
  }

  function setModelLinesColor(modelId, lines_ids, color, color_mode = "constant") {
    return modelCommonStyle.setModelTypeColor(modelId, lines_ids, color, schema, color_mode);
  }

  function modelLineColorMode(id, line_id) {
    const mode = modelLinesCommonStyle.modelLineStyle(id, line_id).color_mode || "constant";
    return mode === "constant" ? "color" : mode;
  }

  return { setModelLinesColor, modelLineColor, modelLineColorMode };
}
