import merge from "lodash/merge";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";

export function useModelBlocksCommonStyle() {
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();

  function modelBlocksStyle(id) {
    return dataStyleState.getStyle(id).blocks;
  }

  function modelBlockStyle(id, block_id) {
    const groupStyle = modelBlocksStyle(id);
    const individualStyle = dataStyleState.getComponentStyle(id, block_id);
    return merge({}, groupStyle, individualStyle);
  }

  function mutateModelBlocksStyle(id, blocks_ids, values) {
    return modelCommonStyle.mutateComponentStyles(id, blocks_ids, values);
  }

  function mutateModelBlockStyle(id, block_id, values) {
    return modelCommonStyle.mutateComponentStyle(id, block_id, values);
  }

  return {
    modelBlocksStyle,
    modelBlockStyle,
    mutateModelBlocksStyle,
    mutateModelBlockStyle,
  };
}
