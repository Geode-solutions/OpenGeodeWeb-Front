import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import merge from "lodash/merge";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";

export function useModelSurfacesCommonStyle() {
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();

  function modelSurfacesStyle(id: string): StyleValues {
    return dataStyleState.getStyle(id).surfaces as StyleValues;
  }

  function modelComponentTypeSurfacesStyle(id: string): StyleValues {
    const defaultStyle = modelSurfacesStyle(id);
    const typeStyle = dataStyleState.getModelComponentTypeStyle(id, "Surface");
    return merge({}, defaultStyle, typeStyle);
  }

  function modelSurfaceStyle(id: string, surface_id?: string): StyleValues {
    if (surface_id === undefined) {
      return modelComponentTypeSurfacesStyle(id);
    }
    const typeStyle = modelComponentTypeSurfacesStyle(id);
    const individualStyle = dataStyleState.getComponentStyle(id, surface_id);
    return merge({}, typeStyle, individualStyle);
  }

  function modelSurfaceColoring(id: string, surface_id?: string): StyleValues {
    return modelSurfaceStyle(id, surface_id).coloring as StyleValues;
  }

  function mutateModelSurfacesColoring(id: string, surfaces_ids: string[], values: StyleValues) {
    return modelCommonStyle.mutateComponentStyles(id, surfaces_ids, {
      coloring: values,
    });
  }

  function mutateModelSurfacesTypeColoring(id: string, values: StyleValues) {
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
