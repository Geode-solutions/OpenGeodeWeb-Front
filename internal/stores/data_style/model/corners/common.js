import merge from "lodash/merge";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";

export function useModelCornersCommonStyle() {
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();

  function modelCornersStyle(id) {
    return dataStyleState.getStyle(id).corners;
  }

  function modelComponentTypeCornersStyle(id) {
    const defaultStyle = modelCornersStyle(id);
    const typeStyle = dataStyleState.getModelComponentTypeStyle(id, "Corner");
    return merge({}, defaultStyle, typeStyle);
  }

  function modelCornerStyle(id, corner_id) {
    if (corner_id === undefined) {
      return modelComponentTypeCornersStyle(id);
    }
    const typeStyle = modelComponentTypeCornersStyle(id);
    const individualStyle = dataStyleState.getComponentStyle(id, corner_id);
    return merge({}, typeStyle, individualStyle);
  }

  function modelCornerColoring(id, corner_id) {
    return modelCornerStyle(id, corner_id).coloring;
  }

  function mutateModelCornersColoring(id, corners_ids, values) {
    return modelCommonStyle.mutateComponentStyles(id, corners_ids, {
      coloring: values,
    });
  }

  function mutateModelCornersTypeColoring(id, values) {
    return modelCommonStyle.mutateModelComponentTypeStyle(id, "Corner", {
      coloring: values,
    });
  }

  return {
    modelCornersStyle,
    modelCornerStyle,
    modelCornerColoring,
    mutateModelCornersColoring,
    mutateModelCornersTypeColoring,
  };
}
