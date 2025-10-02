import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"
import { useMeshPointsStyle } from "./points.js"
import { useMeshEdgesStyle } from "./edges.js"
import { useMeshPolygonsStyle } from "./polygons.js"
import { useMeshPolyhedraStyle } from "./polyhedra.js"

export default function useMeshStyle() {
  const dataStyleStore = useDataStyleStore()
  const pointsStyleStore = useMeshPointsStyle()
  const edgesStyleStore = useMeshEdgesStyle()
  const polygonsStyleStore = useMeshPolygonsStyle()
  const polyhedraStyleStore = useMeshPolyhedraStyle()
  const hybridViewerStore = useHybridViewerStore()

  function setMeshVisibility(id, visibility) {
    return viewer_call(
      {
        schema: viewer_schemas.opengeodeweb_viewer.mesh.visibility,
        params: { id, visibility },
      },
      {
        response_function: () => {
          hybridViewerStore.setVisibility(id, visibility)
          dataStyleStore.styles[id].visibility = visibility
          console.log(`${setMeshVisibility.name} ${id} ${visibility}`)
        },
      },
    )
  }

  function applyMeshDefaultStyle(id) {
    const style = dataStyleStore.getStyle(id)
    const promise_array = []
    for (const [key, value] of Object.entries(style)) {
      if (key == "visibility") {
        promise_array.push(setMeshVisibility(id, value))
      } else if (key == "points") {
        promise_array.push(pointsStyleStore.applyPointsStyle(id, value))
      } else if (key == "edges") {
        promise_array.push(edgesStyleStore.applyEdgesStyle(id, value))
      } else if (key == "polygons") {
        promise_array.push(polygonsStyleStore.applyPolygonsStyle(id, value))
      } else if (key == "polyhedra") {
        promise_array.push(polyhedraStyleStore.applyPolyhedraStyle(id, value))
      }
    }
    return promise_array
  }

  return {
    setMeshVisibility,
    applyMeshDefaultStyle,
    ...useMeshPointsStyle(),
    ...useMeshEdgesStyle(),
    ...useMeshPolygonsStyle(),
    ...useMeshPolyhedraStyle(),
  }
}
