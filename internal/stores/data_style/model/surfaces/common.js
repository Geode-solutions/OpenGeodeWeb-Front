import merge from "lodash/merge";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useModelSurfacesCommonStyle() {
  const dataStyleState = useDataStyleState();

  function modelSurfacesStyle(id) {
    return dataStyleState.getStyle(id).surfaces;
  }

  function modelSurfaceStyle(id, surface_id) {
    const groupStyle = modelSurfacesStyle(id);
    const individualStyle = dataStyleState.getComponentStyle(id, surface_id);
    return merge({}, groupStyle, individualStyle);
  }

  function mutateModelSurfacesStyle(id, surface_ids, values) {
    return dataStyleState.mutateComponentStyles(id, surface_ids, values);
  }

  function mutateModelSurfaceStyle(id, surface_id, values) {
    return dataStyleState.mutateComponentStyle(id, surface_id, values);
  }

  return {
    modelSurfacesStyle,
    modelSurfaceStyle,
    mutateModelSurfacesStyle,
    mutateModelSurfaceStyle,
  };
}
