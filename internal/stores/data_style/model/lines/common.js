import merge from "lodash/merge";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";

export function useModelLinesCommonStyle() {
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();

  function modelLinesStyle(id) {
    return dataStyleState.getStyle(id).lines;
  }

  function modelLineStyle(id, line_id) {
    const groupStyle = modelLinesStyle(id);
    const individualStyle = dataStyleState.getComponentStyle(id, line_id);
    return merge({}, groupStyle, individualStyle);
  }

  function mutateModelLinesStyle(id, line_ids, values) {
    return modelCommonStyle.mutateComponentStyles(id, line_ids, values);
  }

  function mutateModelLineStyle(id, line_id, values) {
    return modelCommonStyle.mutateComponentStyle(id, line_id, values);
  }

  function modelLineVisibility(id, line_id) {
    return modelLineStyle(id, line_id).visibility;
  }

  function modelLineColor(id, line_id) {
    return modelLineStyle(id, line_id).color;
  }

  return {
    modelLinesStyle,
    modelLineStyle,
    modelLineVisibility,
    modelLineColor,
    mutateModelLinesStyle,
    mutateModelLineStyle,
  };
}
