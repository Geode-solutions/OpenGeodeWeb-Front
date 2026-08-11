import merge from "lodash/merge";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";

export function useModelLinesCommonStyle() {
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();

  function modelLinesStyle(id) {
    return dataStyleState.getStyle(id).lines;
  }

  function modelComponentTypeLinesStyle(id) {
    const defaultStyle = modelLinesStyle(id);
    const typeStyle = dataStyleState.getModelComponentTypeStyle(id, "Line");
    return merge({}, defaultStyle, typeStyle);
  }

  function modelLineStyle(id, line_id) {
    if (line_id === undefined) {
      return modelComponentTypeLinesStyle(id);
    }
    const typeStyle = modelComponentTypeLinesStyle(id);
    const individualStyle = dataStyleState.getComponentStyle(id, line_id);
    return merge({}, typeStyle, individualStyle);
  }

  function modelLineColoring(id, line_id) {
    return modelLineStyle(id, line_id).coloring;
  }

  function mutateModelLinesColoring(id, lines_ids, values) {
    modelCommonStyle.mutateModelComponentTypeStyle(id, "Line", {
      coloring: values,
    });
    return modelCommonStyle.mutateComponentStyles(id, lines_ids, {
      coloring: values,
    });
  }

  function mutateModelLinesTypeColoring(id, values) {
    return modelCommonStyle.mutateModelComponentTypeStyle(id, "Line", {
      coloring: values,
    });
  }

  return {
    modelLinesStyle,
    modelLineStyle,
    modelLineColoring,
    mutateModelLinesColoring,
    mutateModelLinesTypeColoring,
  };
}
