import type { DataId, ModelComponentId } from "@ogw_front/types/identifiers";
import { useModelBlocksCommonStyle } from "./common";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

const schema = viewer_schemas.opengeodeweb_viewer.model.blocks.visibility;

export function useModelBlocksVisibility(): {
  setModelBlocksVisibility: (
    modelId: DataId,
    blocks_ids: ModelComponentId[],
    visibility: boolean,
  ) => Promise<unknown>;
  modelBlockVisibility: (modelId: DataId, block_id?: ModelComponentId) => unknown;
} {
  const modelCommonStyle = useModelCommonStyle();
  const modelBlocksCommonStyle = useModelBlocksCommonStyle();

  function modelBlockVisibility(modelId: DataId, block_id?: ModelComponentId): unknown {
    return modelBlocksCommonStyle.modelBlockStyle(modelId, block_id).visibility;
  }

  async function setModelBlocksVisibility(
    modelId: DataId,
    blocks_ids: ModelComponentId[],
    visibility: boolean,
  ): Promise<unknown> {
    const result = await modelCommonStyle.setModelTypeVisibility(
      modelId,
      blocks_ids,
      visibility,
      schema,
    );
    return result;
  }

  return { setModelBlocksVisibility, modelBlockVisibility };
}
