import type { ModelComponentId, ModelId } from "@ogw_front/types/identifiers";
import { useModelBlocksCommonStyle } from "./common";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

const schema = viewer_schemas.opengeodeweb_viewer.model.blocks.visibility;

export function useModelBlocksVisibility(): {
  setModelBlocksVisibility: (
    modelId: ModelId,
    blocks_ids: ModelComponentId[],
    visibility: boolean,
  ) => Promise<unknown>;
  modelBlockVisibility: (modelId: ModelId, block_id?: ModelComponentId) => unknown;
} {
  const modelCommonStyle = useModelCommonStyle();
  const modelBlocksCommonStyle = useModelBlocksCommonStyle();

  function modelBlockVisibility(modelId: ModelId, block_id?: ModelComponentId): unknown {
    return modelBlocksCommonStyle.modelBlockStyle(modelId, block_id).visibility;
  }

  async function setModelBlocksVisibility(
    modelId: ModelId,
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
