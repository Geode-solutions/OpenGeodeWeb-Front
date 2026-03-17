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
    return { ...groupStyle, ...individualStyle }
  }

  function mutateModelSurfacesStyle(id, surface_ids, mutationCallback) {
    return dataStyleStateStore.mutateComponentStyles(
      id,
      surface_ids,
      mutationCallback,
    )
  }

  return {
    modelSurfacesStyle,
    modelSurfaceStyle,
    mutateModelSurfacesStyle,
  }
}

