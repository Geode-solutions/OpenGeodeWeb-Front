import merge from "lodash/merge";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useModelBlocksCommonStyle() {
  const dataStyleStateStore = useDataStyleState();

  function modelBlocksStyle(id) {
    return dataStyleStateStore.getStyle(id).blocks;
  }

  function modelBlockStyle(id, block_id) {
    const groupStyle = modelBlocksStyle(id);
    const individualStyle = dataStyleStateStore.getComponentStyle(id, block_id);
    return merge({}, groupStyle, individualStyle);
  }

  function mutateModelBlocksStyle(id, block_ids, values) {
    return dataStyleStateStore.mutateComponentStyles(id, block_ids, values);
  }

  function mutateModelBlockStyle(id, block_id, values) {
    return dataStyleStateStore.mutateComponentStyle(id, block_id, values);
  }

  return {
    modelBlocksStyle,
    modelBlockStyle,
    mutateModelBlocksStyle,
    mutateModelBlockStyle,
  };
}
