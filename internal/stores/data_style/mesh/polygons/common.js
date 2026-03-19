import { useDataStyleStateStore } from "@ogw_internal/stores/data_style/state"

export function useMeshPolygonsCommonStyle() {
  const dataStyleStateStore = useDataStyleStateStore()

  function mutateMeshPolygonsStyle(id, values) {
    return dataStyleStateStore.mutateStyle(id, {
      polygons: values,
    })
  }

  function meshPolygonsStyle(id) {
    return dataStyleStateStore.getStyle(id).polygons
  }

  return {
    meshPolygonsStyle,
    mutateMeshPolygonsStyle,
  }
}
