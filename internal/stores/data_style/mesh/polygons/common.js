import { useDataStyleStateStore } from "../../state"

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

  return {
    meshPolygonsStyle,
    meshPolygonsColoring,
    meshPolygonsActiveColoring,
  }
}
