import type { LineId, ModelId } from "@ogw_front/types/identifiers";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useModelLinesCommonStyle } from "./common";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

const schema = viewer_schemas.opengeodeweb_viewer.model.lines.visibility;

export function useModelLinesVisibility(): {
  setModelLinesVisibility: (
    modelId: ModelId,
    lines_ids: LineId[],
    visibility: boolean,
  ) => Promise<unknown>;
  modelLineVisibility: (modelId: ModelId, line_id?: LineId) => unknown;
} {
  const modelCommonStyle = useModelCommonStyle();
  const modelLinesCommonStyle = useModelLinesCommonStyle();

  function modelLineVisibility(modelId: ModelId, line_id?: LineId): unknown {
    return modelLinesCommonStyle.modelLineStyle(modelId, line_id).visibility;
  }

  async function setModelLinesVisibility(
    modelId: ModelId,
    lines_ids: LineId[],
    visibility: boolean,
  ): Promise<unknown> {
    const result = await modelCommonStyle.setModelTypeVisibility(
      modelId,
      lines_ids,
      visibility,
      schema,
    );
    return result;
  }

  return { setModelLinesVisibility, modelLineVisibility };
}
