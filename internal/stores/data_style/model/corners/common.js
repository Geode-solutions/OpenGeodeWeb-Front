import merge from "lodash/merge";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useModelCornersCommonStyle() {
  const dataStyleState = useDataStyleState();

  function modelCornersStyle(id) {
    return dataStyleState.getStyle(id).corners;
  }

  function modelCornerStyle(id, corner_id) {
    const groupStyle = modelCornersStyle(id);
    const individualStyle = dataStyleState.getComponentStyle(id, corner_id);
    return merge({}, groupStyle, individualStyle);
  }

  function mutateModelCornersStyle(id, corner_ids, values) {
    return dataStyleState.mutateComponentStyles(id, corner_ids, values);
  }

  function mutateModelCornerStyle(id, corner_id, values) {
    return dataStyleState.mutateComponentStyle(id, corner_id, values);
  }

  function modelCornerVisibility(id, corner_id) {
    return modelCornerStyle(id, corner_id).visibility;
  }

  function modelCornerColor(id, corner_id) {
    return modelCornerStyle(id, corner_id).color;
  }

  return {
    modelCornersStyle,
    modelCornerStyle,
    modelCornerVisibility,
    modelCornerColor,
    mutateModelCornersStyle,
    mutateModelCornerStyle,
  };
}
