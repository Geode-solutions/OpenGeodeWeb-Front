import type { StyleValues } from "../../types";
import merge from "lodash/merge";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";

export function useModelBlocksCommonStyle() {
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();

  function modelBlocksStyle(id: string): StyleValues {
    return dataStyleState.getStyle(id).blocks as StyleValues;
  }

  function modelComponentTypeBlocksStyle(id: string): StyleValues {
    const defaultStyle = modelBlocksStyle(id);
    const typeStyle = dataStyleState.getModelComponentTypeStyle(id, "Block");
    return merge({}, defaultStyle, typeStyle);
  }

  function modelBlockStyle(id: string, block_id?: string): StyleValues {
    if (block_id === undefined) {
      return modelComponentTypeBlocksStyle(id);
    }
    const typeStyle = modelComponentTypeBlocksStyle(id);
    const individualStyle = dataStyleState.getComponentStyle(id, block_id);
    return merge({}, typeStyle, individualStyle);
  }

  function modelBlockColoring(id: string, block_id?: string): StyleValues {
    return modelBlockStyle(id, block_id).coloring as StyleValues;
  }

  function mutateModelBlocksColoring(id: string, blocks_ids: string[], values: StyleValues) {
    return modelCommonStyle.mutateComponentStyles(id, blocks_ids, {
      coloring: values,
    });
  }

  function mutateModelBlocksTypeColoring(id: string, values: StyleValues) {
    return modelCommonStyle.mutateModelComponentTypeStyle(id, "Block", {
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
