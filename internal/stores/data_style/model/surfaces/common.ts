import merge from "lodash/merge";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";

export function useModelSurfacesCommonStyle() {
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();

  function modelSurfacesStyle(id) {
    return dataStyleState.getStyle(id).surfaces;
  }

  function modelComponentTypeSurfacesStyle(id) {
    const defaultStyle = modelSurfacesStyle(id);
    const typeStyle = dataStyleState.getModelComponentTypeStyle(id, "Surface");
    return merge({}, defaultStyle, typeStyle);
  }

  function modelSurfaceStyle(id, surface_id) {
    if (surface_id === undefined) {
      return modelComponentTypeSurfacesStyle(id);
    }
    const typeStyle = modelComponentTypeSurfacesStyle(id);
    const individualStyle = dataStyleState.getComponentStyle(id, surface_id);
    return merge({}, typeStyle, individualStyle);
  }

  function modelSurfaceColoring(id, surface_id) {
    return modelSurfaceStyle(id, surface_id).coloring;
  }

  function mutateModelSurfacesColoring(id, surfaces_ids, values) {
    return modelCommonStyle.mutateComponentStyles(id, surfaces_ids, {
      coloring: values,
    });
  }

  function mutateModelSurfacesTypeColoring(id, values) {
    return modelCommonStyle.mutateModelComponentTypeStyle(id, "Surface", {
      coloring: values,
    });
  }

  return {
    modelSurfacesStyle,
    modelSurfaceStyle,
    modelSurfaceColoring,
    mutateModelSurfacesColoring,
    mutateModelSurfacesTypeColoring,
  };
}
