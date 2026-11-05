import type { DataId } from "@ogw_front/types/identifiers";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useModelLinesCommonStyle } from "./common";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

const schema = viewer_schemas.opengeodeweb_viewer.model.lines.visibility;

export function useModelLinesVisibility(): {
  setModelLinesVisibility: (
    modelId: DataId,
    lines_ids: string[],
    visibility: boolean,
  ) => Promise<unknown>;
  modelLineVisibility: (modelId: DataId, line_id?: string) => unknown;
} {
  const modelCommonStyle = useModelCommonStyle();
  const modelLinesCommonStyle = useModelLinesCommonStyle();

  function modelLineVisibility(modelId: DataId, line_id?: string): unknown {
    return modelLinesCommonStyle.modelLineStyle(modelId, line_id).visibility;
  }

  async function setModelLinesVisibility(
    modelId: DataId,
    lines_ids: string[],
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
