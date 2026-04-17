import { useModelBlocksCommonStyle } from "./common";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const schema = viewer_schemas.opengeodeweb_viewer.model.blocks.color;

export function useModelBlocksColor() {
  const modelCommonStyle = useModelCommonStyle();
  const modelBlocksCommonStyle = useModelBlocksCommonStyle();

  function modelBlockColor(id, block_id) {
    return modelBlocksCommonStyle.modelBlockStyle(id, block_id).color;
  }

  function setModelBlocksColor(modelId, blocks_ids, color, color_mode = "constant") {
    return modelCommonStyle.setModelTypeColor(modelId, blocks_ids, color, schema, color_mode);
  }

  return { setModelBlocksColor, modelBlockColor };
}
