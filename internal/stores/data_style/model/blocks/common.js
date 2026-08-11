import merge from "lodash/merge";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";

export function useModelBlocksCommonStyle() {
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();

  function modelBlocksStyle(id) {
    return dataStyleState.getStyle(id).blocks;
  }

  function modelComponentTypeBlocksStyle(id) {
    const defaultStyle = modelBlocksStyle(id);
    const typeStyle = dataStyleState.getModelComponentTypeStyle(id, "Block");
    return merge({}, defaultStyle, typeStyle);
  }

  function modelBlockStyle(id, block_id) {
    if (block_id === undefined) {
      return modelComponentTypeBlocksStyle(id);
    }
    const typeStyle = modelComponentTypeBlocksStyle(id);
    const individualStyle = dataStyleState.getComponentStyle(id, block_id);
    return merge({}, typeStyle, individualStyle);
  }

  function modelBlockColoring(id, block_id) {
    return modelBlockStyle(id, block_id).coloring;
  }

  function mutateModelBlocksColoring(id, blocks_ids, values) {
    modelCommonStyle.mutateModelComponentTypeStyle(id, "Block", {
      coloring: values,
    });
    return modelCommonStyle.mutateComponentStyles(id, blocks_ids, {
      coloring: values,
    });
  }

  function mutateModelBlocksTypeColoring(id, values) {
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
