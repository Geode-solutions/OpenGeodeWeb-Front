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

  function mutateModelBlocksStyle(id, block_ids, values) {
    return modelCommonStyle.mutateComponentStyles(id, block_ids, values);
  }

  function mutateModelBlockStyle(id, block_id, values) {
    return modelCommonStyle.mutateComponentStyle(id, block_id, values);
  }

  function modelBlockVisibility(id, block_id) {
    return modelBlockStyle(id, block_id).visibility;
  }

  function modelBlockColor(id, block_id) {
    return modelBlockStyle(id, block_id).color;
  }

  return {
    modelBlocksStyle,
    modelBlockStyle,
    modelBlockVisibility,
    modelBlockColor,
    mutateModelBlocksStyle,
    mutateModelBlockStyle,
  };
}
