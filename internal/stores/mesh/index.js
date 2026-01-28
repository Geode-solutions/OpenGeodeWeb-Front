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
      } else {
        throw new Error("Unknown mesh key: " + key)
      }
    }
    return Promise.all(promise_array)
  }

  function setVertexScalarRange(id, meshType, minimum, maximum) {
    switch (meshType) {
      case "points":
        return meshPointsStyleStore.setMeshPointsVertexScalarRange(id, minimum, maximum)
      case "edges":
        return meshEdgesStyleStore.setMeshEdgesVertexScalarRange(id, minimum, maximum)
      case "cells":
        return meshCellsStyleStore.setMeshCellsVertexScalarRange(id, minimum, maximum)
      case "polygons":
        return meshPolygonsStyleStore.setMeshPolygonsVertexScalarRange(id, minimum, maximum)
      case "polyhedra":
        return meshPolyhedraStyleStore.setPolyhedraVertexScalarRange(id, minimum, maximum)
      default:
        throw new Error("Unknown meshType for vertex scalar range: " + meshType)
    }
  }

  function setVertexColorMap(id, meshType, points) {
    switch (meshType) {
      case "points":
        return meshPointsStyleStore.setMeshPointsVertexColorMap(id, points)
      case "edges":
        return meshEdgesStyleStore.setMeshEdgesVertexColorMap(id, points)
      case "cells":
        return meshCellsStyleStore.setMeshCellsVertexColorMap(id, points)
      case "polygons":
        return meshPolygonsStyleStore.setMeshPolygonsVertexColorMap(id, points)
      case "polyhedra":
        return meshPolyhedraStyleStore.setPolyhedraVertexColorMap(id, points)
      default:
        throw new Error("Unknown meshType for vertex color map: " + meshType)
    }
  }

  function setElementScalarRange(id, elementType, minimum, maximum) {
    switch (elementType) {
      case "cell":
        return meshCellsStyleStore.setMeshCellsCellScalarRange(id, minimum, maximum)
      case "polygon":
        return meshPolygonsStyleStore.setMeshPolygonsPolygonScalarRange(id, minimum, maximum)
      case "polyhedron":
        return meshPolyhedraStyleStore.setPolyhedraPolyhedronScalarRange(id, minimum, maximum)
      default:
        throw new Error("Unknown elementType for scalar range: " + elementType)
    }
  }

  function setElementColorMap(id, elementType, points) {
    switch (elementType) {
      case "cell":
        return meshCellsStyleStore.setMeshCellsCellColorMap(id, points)
      case "polygon":
        return meshPolygonsStyleStore.setMeshPolygonsPolygonColorMap(id, points)
      case "polyhedron":
        return meshPolyhedraStyleStore.setPolyhedraPolyhedraColorMap(id, points)
      default:
        throw new Error("Unknown elementType for color map: " + elementType)
    }
  }

  return {
    meshVisibility,
    setMeshVisibility,
    applyMeshStyle,
    setVertexScalarRange,
    setVertexColorMap,
    setElementScalarRange,
    setElementColorMap,
    ...useMeshPointsStyle(),
    ...useMeshEdgesStyle(),
    ...useMeshCellsStyle(),
    ...useMeshPolygonsStyle(),
    ...useMeshPolyhedraStyle(),
  }
}
