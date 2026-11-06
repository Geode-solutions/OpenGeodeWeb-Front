import type { DataId, ModelComponentId } from "@ogw_front/types/identifiers";
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import merge from "lodash/merge";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";

export function useModelBlocksCommonStyle(): {
  modelBlocksStyle: (modelId: DataId) => StyleValues;
  modelBlockStyle: (modelId: DataId, block_id?: ModelComponentId) => StyleValues;
  modelBlockColoring: (modelId: DataId, block_id?: ModelComponentId) => StyleValues;
  mutateModelBlocksColoring: (
    modelId: DataId,
    blocks_ids: ModelComponentId[],
    values: StyleValues,
  ) => Promise<void>;
  mutateModelBlocksTypeColoring: (modelId: DataId, values: StyleValues) => Promise<void>;
} {
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();

  function modelBlocksStyle(modelId: DataId): StyleValues {
    return dataStyleState.getStyle(modelId).blocks ?? {};
  }

  function modelComponentTypeBlocksStyle(modelId: DataId): StyleValues {
    const defaultStyle = modelBlocksStyle(modelId);
    const typeStyle = dataStyleState.getModelComponentTypeStyle(modelId, "Block");
    return merge({}, defaultStyle, typeStyle);
  }

  function modelBlockStyle(modelId: DataId, block_id?: ModelComponentId): StyleValues {
    if (block_id === undefined) {
      return modelComponentTypeBlocksStyle(modelId);
    }
    const typeStyle = modelComponentTypeBlocksStyle(modelId);
    const individualStyle = dataStyleState.getComponentStyle(modelId, block_id);
    return merge({}, typeStyle, individualStyle);
  }

  function modelBlockColoring(modelId: DataId, block_id?: ModelComponentId): StyleValues {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring shape is defined by the data style schema.
    return modelBlockStyle(modelId, block_id).coloring as StyleValues;
  }

  async function mutateModelBlocksColoring(
    modelId: DataId,
    blocks_ids: ModelComponentId[],
    values: StyleValues,
  ): Promise<void> {
    await modelCommonStyle.mutateComponentStyles(modelId, blocks_ids, {
      coloring: values,
    });
  }

  async function mutateModelBlocksTypeColoring(
    modelId: DataId,
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
