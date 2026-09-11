import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useModelLinesCommonStyle } from "./common";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const schema = viewer_schemas.opengeodeweb_viewer.model.lines.visibility;

export function useModelLinesVisibility() {
  const modelCommonStyle = useModelCommonStyle();
  const modelLinesCommonStyle = useModelLinesCommonStyle();

  function modelLineVisibility(id, line_id) {
    return modelLinesCommonStyle.modelLineStyle(id, line_id).visibility;
  }

  function setModelLinesVisibility(modelId, lines_ids, visibility) {
    return modelCommonStyle.setModelTypeVisibility(modelId, lines_ids, visibility, schema);
  }

  return { setModelLinesVisibility, modelLineVisibility };
}
