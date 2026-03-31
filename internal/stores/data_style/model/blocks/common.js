import merge from "lodash/merge";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useModelBlocksCommonStyle() {
  const dataStyleState = useDataStyleState();

  function modelBlocksStyle(id) {
    return dataStyleState.getStyle(id).blocks;
  }

  function modelBlockStyle(id, block_id) {
    const groupStyle = modelBlocksStyle(id);
    const individualStyle = dataStyleState.getComponentStyle(id, block_id);
    return merge({}, groupStyle, individualStyle);
  }

  function mutateModelBlocksStyle(id, block_ids, values) {
    return dataStyleState.mutateComponentStyles(id, block_ids, values);
  }

  function mutateModelBlockStyle(id, block_id, values) {
    return dataStyleState.mutateComponentStyle(id, block_id, values);
  }

  return {
    modelBlocksStyle,
    modelBlockStyle,
    mutateModelBlocksStyle,
    mutateModelBlockStyle,
  };
}
