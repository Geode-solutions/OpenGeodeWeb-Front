// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useMeshPointsStyle } from "./points.js"
import { useMeshEdgesStyle } from "./edges.js"
import { useMeshPolygonsStyle } from "./polygons.js"
import { useMeshPolyhedraStyle } from "./polyhedra.js"

// Local constants
const mesh_schemas = viewer_schemas.opengeodeweb_viewer.mesh

export default function useMeshStyle() {
  const dataStyleStore = useDataStyleStore()
  const pointsStyleStore = useMeshPointsStyle()
  const edgesStyleStore = useMeshEdgesStyle()
  const meshPolygonsStyleStore = useMeshPolygonsStyle()
  const meshPolyhedraStyleStore = useMeshPolyhedraStyle()
  const hybridViewerStore = useHybridViewerStore()

  function meshVisibility(id) {
    return dataStyleStore.getStyle(id).visibility
  }
  function setMeshVisibility(id, visibility) {
    return viewer_call(
      {
        schema: mesh_schemas.visibility,
        params: { id, visibility },
      },
      {
        response_function: () => {
          hybridViewerStore.setVisibility(id, visibility)
          dataStyleStore.getStyle(id).visibility = visibility
          console.log(setMeshVisibility.name, { id }, meshVisibility(id))
        },
      },
    )
  }

  function applyMeshStyle(id) {
    const style = dataStyleStore.getStyle(id)
    console.log(
      "[MeshStyle] applyMeshDefaultStyle for id:",
      id,
      "style:",
      style,
    )
    const promise_array = []
    for (const [key, value] of Object.entries(style)) {
      if (key === "visibility") {
        promise_array.push(setMeshVisibility(id, value))
      } else if (key === "points") {
        promise_array.push(pointsStyleStore.applyMeshPointsStyle(id))
      } else if (key === "edges") {
        promise_array.push(edgesStyleStore.applyMeshEdgesStyle(id))
      } else if (key === "polygons") {
        promise_array.push(meshPolygonsStyleStore.applyMeshPolygonsStyle(id))
      } else if (key === "polyhedra") {
        promise_array.push(meshPolyhedraStyleStore.applyMeshPolyhedraStyle(id))
      } else {
        throw new Error("Unknown mesh key: " + key)
      }
    }
    return Promise.all(promise_array)
  }

  return {
    meshVisibility,
    setMeshVisibility,
    applyMeshStyle,
    ...useMeshPointsStyle(),
    ...useMeshEdgesStyle(),
    ...useMeshPolygonsStyle(),
    ...useMeshPolyhedraStyle(),
  }
}
