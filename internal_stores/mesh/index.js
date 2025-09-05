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
        },
      },
    )
  }

  async function applyMeshDefaultStyle(id) {
    return new Promise(async (resolve) => {
      const id_style = dataStyleStore.styles[id]
      for (const [key, value] of Object.entries(id_style)) {
        if (key == "visibility") {
          await setMeshVisibility(id, value)
        } else if (key == "points") {
          await pointsStyleStore.applyPointsStyle(id, value)
        } else if (key == "edges") {
          await edgesStyleStore.applyEdgesStyle(id, value)
        } else if (key == "polygons") {
          await polygonsStyleStore.applyPolygonsStyle(id, value)
        } else if (key == "polyhedra") {
          await polyhedraStyleStore.applyPolyhedraStyle(id, value)
        }
      }
      resolve()
    })
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
