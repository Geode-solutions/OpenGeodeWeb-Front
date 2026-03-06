import { useDataStyleStateStore } from "../../state"

export function useModelSurfacesCommonStyle() {
  const dataStyleStateStore = useDataStyleStateStore()

  function modelSurfacesStyle(id) {
    return dataStyleStateStore.getStyle(id).surfaces
  }

  function modelSurfaceStyle(id, surface_id) {
    const groupStyle = modelSurfacesStyle(id)
    const individualStyle = dataStyleStateStore.getComponentStyle(id, surface_id)
    return { ...groupStyle, ...individualStyle }
  }

  return {
    modelSurfacesStyle,
    modelSurfaceStyle,
  }
}
