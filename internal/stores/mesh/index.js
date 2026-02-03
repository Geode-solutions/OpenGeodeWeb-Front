// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer"
import { useDataStyleStateStore } from "../data_style_state"
import { useViewerStore } from "@ogw_front/stores/viewer"
import { useMeshPointsStyle } from "./points"
import { useMeshEdgesStyle } from "./edges"
import { useMeshCellsStyle } from "./cells"
import { useMeshPolygonsStyle } from "./polygons"
import { useMeshPolyhedraStyle } from "./polyhedra"

// Local constants
const mesh_schemas = viewer_schemas.opengeodeweb_viewer.mesh

export default function useMeshStyle() {
  const dataStyleStateStore = useDataStyleStateStore()
  const meshCellsStyleStore = useMeshCellsStyle()
  const meshEdgesStyleStore = useMeshEdgesStyle()
  const meshPointsStyleStore = useMeshPointsStyle()
  const meshPolygonsStyleStore = useMeshPolygonsStyle()
  const meshPolyhedraStyleStore = useMeshPolyhedraStyle()
  const viewerStore = useViewerStore()
  const hybridViewerStore = useHybridViewerStore()

  function meshVisibility(id) {
    return dataStyleStateStore.getStyle(id).visibility
  }
  function setMeshVisibility(id, visibility) {
    return viewerStore.request(
      mesh_schemas.visibility,
      { id, visibility },
      {
        response_function: () => {
          hybridViewerStore.setVisibility(id, visibility)
          dataStyleStateStore.getStyle(id).visibility = visibility
          console.log(setMeshVisibility.name, { id }, meshVisibility(id))
        },
      },
    )
  }

  function applyMeshStyle(id) {
    const style = dataStyleStateStore.getStyle(id)
    const promise_array = []
    for (const [key, value] of Object.entries(style)) {
      if (key === "visibility") {
        promise_array.push(setMeshVisibility(id, value))
      } else if (key === "points") {
        promise_array.push(meshPointsStyleStore.applyMeshPointsStyle(id))
      } else if (key === "edges") {
        promise_array.push(meshEdgesStyleStore.applyMeshEdgesStyle(id))
      } else if (key === "cells") {
        promise_array.push(meshCellsStyleStore.applyMeshCellsStyle(id))
      } else if (key === "polygons") {
        promise_array.push(meshPolygonsStyleStore.applyMeshPolygonsStyle(id))
      } else if (key === "polyhedra") {
        promise_array.push(meshPolyhedraStyleStore.applyMeshPolyhedraStyle(id))
      } else if (key === "attributes") {
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
    ...useMeshCellsStyle(),
    ...useMeshPolygonsStyle(),
    ...useMeshPolyhedraStyle(),
  }
}
