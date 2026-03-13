import { useDataStyleStateStore } from "@ogw_internal/stores/data_style/state"

export function useModelSurfacesCommonStyle() {
  const dataStyleStateStore = useDataStyleStateStore()

  function modelSurfacesStyle(id) {
    return dataStyleStateStore.getStyle(id).surfaces
  }

  function modelSurfaceStyle(id, surface_id) {
    if (!modelSurfacesStyle(id)[surface_id]) {
      modelSurfacesStyle(id)[surface_id] = {}
    }
    return modelSurfacesStyle(id)[surface_id]
  }

  return {
    modelSurfacesStyle,
    modelSurfaceStyle,
  }
}
