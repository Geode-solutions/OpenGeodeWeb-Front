import { useDataStyleStateStore } from "@ogw_internal/stores/data_style/state"

export function useMeshPolygonsCommonStyle() {
  const dataStyleStateStore = useDataStyleStateStore()

  function meshPolygonsStyle(id) {
    return dataStyleStateStore.getStyle(id).polygons
  }

  function meshPolygonsColoring(id) {
    return meshPolygonsStyle(id).coloring
  }

  function meshPolygonsActiveColoring(id) {
    return meshPolygonsColoring(id).active
  }

  function mutateMeshPolygonsStyle(id, mutationCallback) {
    return dataStyleStateStore.mutateStyle(id, (style) => {
      mutationCallback(style.polygons)
    })
  }

  function mutateMeshPolygonsColoringStyle(id, mutationCallback) {
    return mutateMeshPolygonsStyle(id, (polygons) => {
      mutationCallback(polygons.coloring)
    })
  }

  function mutateMeshPolygonsPolygonStyle(id, mutationCallback) {
    return mutateMeshPolygonsColoringStyle(id, (coloring) => {
      mutationCallback(coloring.polygon)
    })
  }

  function mutateMeshPolygonsVertexStyle(id, mutationCallback) {
    return mutateMeshPolygonsColoringStyle(id, (coloring) => {
      mutationCallback(coloring.vertex)
    })
  }

  return {
    meshPolygonsStyle,
    meshPolygonsColoring,
    meshPolygonsActiveColoring,
    mutateMeshPolygonsStyle,
    mutateMeshPolygonsColoringStyle,
    mutateMeshPolygonsPolygonStyle,
    mutateMeshPolygonsVertexStyle,
  }
}
