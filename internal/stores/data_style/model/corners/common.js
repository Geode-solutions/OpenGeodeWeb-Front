import merge from "lodash/merge";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useModelCornersCommonStyle() {
  const dataStyleStateStore = useDataStyleState();

  function modelCornersStyle(id) {
    return dataStyleStateStore.getStyle(id).corners;
  }

  function modelCornerStyle(id, corner_id) {
    const groupStyle = modelCornersStyle(id);
    const individualStyle = dataStyleStateStore.getComponentStyle(id, corner_id);
    return merge({}, groupStyle, individualStyle);
  }

  function mutateModelCornersStyle(id, corner_ids, values) {
    return dataStyleStateStore.mutateComponentStyles(id, corner_ids, values);
  }

  function mutateModelCornerStyle(id, corner_id, values) {
    return dataStyleStateStore.mutateComponentStyle(id, corner_id, values);
  }

  return {
    modelCornersStyle,
    modelCornerStyle,
    mutateModelCornersStyle,
    mutateModelCornerStyle,
  };
}
