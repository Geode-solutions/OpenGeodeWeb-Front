import { useModelBlocksCommonStyle } from "./common";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const schema = viewer_schemas.opengeodeweb_viewer.model.blocks.visibility;

export function useModelBlocksVisibility() {
  const modelCommonStyle = useModelCommonStyle();
  const modelBlocksCommonStyle = useModelBlocksCommonStyle();

  function modelBlockVisibility(id, block_id) {
    return modelBlocksCommonStyle.modelBlockStyle(id, block_id).visibility;
  }

  function setModelBlocksVisibility(modelId, componentIds, visibility) {
    return modelCommonStyle.setModelTypeVisibility(modelId, componentIds, visibility, schema);
  }

  return { setModelBlocksVisibility, modelBlockVisibility };
}
