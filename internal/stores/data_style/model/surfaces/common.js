import merge from "lodash/merge"
import { useDataStyleStateStore } from "@ogw_internal/stores/data_style/state"

export function useModelSurfacesCommonStyle() {
  const dataStyleStateStore = useDataStyleStateStore()

  function modelSurfacesStyle(id) {
    return dataStyleStateStore.getStyle(id).surfaces
  }

  function modelSurfaceStyle(id, surface_id) {
    const groupStyle = modelSurfacesStyle(id)
    const individualStyle = dataStyleStateStore.getComponentStyle(
      id,
      surface_id,
    )
    return merge({}, groupStyle, individualStyle)
  }

  function mutateModelSurfacesStyle(id, surface_ids, values) {
    return dataStyleStateStore.mutateComponentStyles(id, surface_ids, values)
  }

  function mutateModelSurfaceStyle(id, surface_id, values) {
    return dataStyleStateStore.mutateComponentStyle(id, surface_id, values)
  }

  return {
    modelSurfacesStyle,
    modelSurfaceStyle,
    mutateModelSurfacesStyle,
    mutateModelSurfaceStyle,
  }
}
