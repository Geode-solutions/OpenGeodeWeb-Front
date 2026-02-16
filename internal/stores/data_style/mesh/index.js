// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer"
import { useViewerStore } from "@ogw_front/stores/viewer"

import { useDataStyleStateStore } from "../state"
import { useMeshCellsStyle } from "./cells"
import { useMeshEdgesStyle } from "./edges"
import { useMeshPointsStyle } from "./points"
import { useMeshPolygonsStyle } from "./polygons"
import { useMeshPolyhedraStyle } from "./polyhedra"

// Local constants
const meshSchemas = viewer_schemas.opengeodeweb_viewer.mesh

export default function useMeshStyle() {
  const hybridViewerStore = useHybridViewerStore()
  const viewerStore = useViewerStore()
  const dataStyleState = useDataStyleStateStore()
  const meshPointsStyle = useMeshPointsStyle()
  const meshEdgesStyle = useMeshEdgesStyle()
  const meshCellsStyle = useMeshCellsStyle()
  const meshPolygonsStyle = useMeshPolygonsStyle()
  const meshPolyhedraStyle = useMeshPolyhedraStyle()

  function meshVisibility(id) {
    return dataStyleState.getStyle(id).visibility
  }
  function setMeshVisibility(id, visibility) {
    return viewerStore.request(
      meshSchemas.visibility,
      { id, visibility },
      {
        response_function: () => {
          hybridViewerStore.setVisibility(id, visibility)
          dataStyleState.getStyle(id).visibility = visibility
          console.log(setMeshVisibility.name, { id }, meshVisibility(id))
        },
      },
    )
  }

  function applyMeshStyle(id) {
    const style = dataStyleState.getStyle(id)
    const promise_array = []
    for (const [key, value] of Object.entries(style)) {
      if (key === "visibility") {
        promise_array.push(setMeshVisibility(id, value))
      } else if (key === "points") {
        promise_array.push(meshPointsStyle.applyMeshPointsStyle(id))
      } else if (key === "edges") {
        promise_array.push(meshEdgesStyle.applyMeshEdgesStyle(id))
      } else if (key === "cells") {
        promise_array.push(meshCellsStyle.applyMeshCellsStyle(id))
      } else if (key === "polygons") {
        promise_array.push(meshPolygonsStyle.applyMeshPolygonsStyle(id))
      } else if (key === "polyhedra") {
        promise_array.push(meshPolyhedraStyle.applyMeshPolyhedraStyle(id))
      } else if (key === "attributes") {
      } else {
        throw new Error(`Unknown mesh key: ${key}`)
      }
    }
    return Promise.all(promise_array)
  }

  return {
    meshVisibility,
    setMeshVisibility,
    applyMeshStyle,
    ...meshPointsStyle,
    ...meshEdgesStyle,
    ...meshCellsStyle,
    ...meshPolygonsStyle,
    ...meshPolyhedraStyle,
  }
}
