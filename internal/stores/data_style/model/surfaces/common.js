import merge from "lodash/merge";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";

export function useModelSurfacesCommonStyle() {
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();

  function modelSurfacesStyle(id) {
    return dataStyleState.getStyle(id).surfaces;
  }

  function modelSurfaceStyle(id, surface_id) {
    const groupStyle = modelSurfacesStyle(id);
    const individualStyle = dataStyleState.getComponentStyle(id, surface_id);
    return merge({}, groupStyle, individualStyle);
  }

  function modelSurfaceColoring(id, surface_id) {
    return modelSurfaceStyle(id, surface_id).coloring;
  }

  function mutateModelSurfacesColoring(id, surfaces_ids, values) {
    return modelCommonStyle.mutateComponentStyles(id, surfaces_ids, {
      coloring: values,
    });
  }

  function mutateModelSurfaceColoring(id, surface_id, values) {
    return modelCommonStyle.mutateComponentStyle(id, surface_id, {
      coloring: values,
    });
  }

  return {
    modelSurfacesStyle,
    modelSurfaceStyle,
    modelSurfaceColoring,
    mutateModelSurfacesColoring,
    mutateModelSurfaceColoring,
  };
}
