import merge from "lodash/merge";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";

export function useModelCornersCommonStyle() {
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();

  function modelCornersStyle(id) {
    return dataStyleState.getStyle(id).corners;
  }

  function modelCornerStyle(id, corner_id) {
    const groupStyle = modelCornersStyle(id);
    const individualStyle = dataStyleState.getComponentStyle(id, corner_id);
    return merge({}, groupStyle, individualStyle);
  }

  function mutateModelCornersStyle(id, corners_ids, values) {
    return modelCommonStyle.mutateComponentStyles(id, corners_ids, values);
  }

  function mutateModelCornerStyle(id, corner_id, values) {
    return modelCommonStyle.mutateComponentStyle(id, corner_id, values);
  }


  return {
    modelCornersStyle,
    modelCornerStyle,
    mutateModelCornersStyle,
    mutateModelCornerStyle,
  };
}
