import type { BlockId, ModelId } from "@ogw_front/types/identifiers";
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import merge from "lodash/merge";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";

export function useModelBlocksCommonStyle(): {
  modelBlocksStyle: (modelId: ModelId) => StyleValues;
  modelBlockStyle: (modelId: ModelId, block_id?: BlockId) => StyleValues;
  modelBlockColoring: (modelId: ModelId, block_id?: BlockId) => StyleValues;
  mutateModelBlocksColoring: (
    modelId: ModelId,
    blocks_ids: BlockId[],
    values: StyleValues,
  ) => Promise<void>;
  mutateModelBlocksTypeColoring: (modelId: ModelId, values: StyleValues) => Promise<void>;
} {
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();

  function modelBlocksStyle(modelId: ModelId): StyleValues {
    return dataStyleState.getStyle(modelId).blocks ?? {};
  }

  function modelComponentTypeBlocksStyle(modelId: ModelId): StyleValues {
    const defaultStyle = modelBlocksStyle(modelId);
    const typeStyle = dataStyleState.getModelComponentTypeStyle(modelId, "Block");
    return merge({}, defaultStyle, typeStyle);
  }

  function modelBlockStyle(modelId: ModelId, block_id?: BlockId): StyleValues {
    if (block_id === undefined) {
      return modelComponentTypeBlocksStyle(modelId);
    }
    const typeStyle = modelComponentTypeBlocksStyle(modelId);
    const individualStyle = dataStyleState.getComponentStyle(modelId, block_id);
    return merge({}, typeStyle, individualStyle);
  }

  function modelBlockColoring(modelId: ModelId, block_id?: BlockId): StyleValues {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring shape is defined by the data style schema.
    return modelBlockStyle(modelId, block_id).coloring as StyleValues;
  }

  async function mutateModelBlocksColoring(
    modelId: ModelId,
    blocks_ids: BlockId[],
    values: StyleValues,
  ): Promise<void> {
    await modelCommonStyle.mutateComponentStyles(modelId, blocks_ids, {
      coloring: values,
    });
  }

  async function mutateModelBlocksTypeColoring(
    modelId: ModelId,
    values: StyleValues,
  ): Promise<void> {
    await modelCommonStyle.mutateModelComponentTypeStyle(modelId, "Block", {
      coloring: values,
    });
  }

  return {
    modelBlocksStyle,
    modelBlockStyle,
    modelBlockColoring,
    mutateModelBlocksColoring,
    mutateModelBlocksTypeColoring,
  };
}
