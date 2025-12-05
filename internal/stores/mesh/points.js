// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStyleStore } from "@ogw_front/stores/data_style.js"
import { useViewerStore } from "@ogw_front/stores/viewer.js"

// Local constants
const mesh_points_schemas = viewer_schemas.opengeodeweb_viewer.mesh.points

export function useMeshPointsStyle() {
  const dataStyleStore = useDataStyleStore()
  const viewerStore = useViewerStore()

  function meshPointsStyle(id) {
    return dataStyleStore.getStyle(id).points
  }

  function meshPointsVisibility(id) {
    return meshPointsStyle(id).visibility
  }
  function setMeshPointsVisibility(id, visibility) {
    const points_style = meshPointsStyle(id)
    return viewerStore.request(
      mesh_points_schemas.visibility,
      { id, visibility },
      {
        response_function: () => {
          points_style.visibility = visibility
          console.log(
            setMeshPointsVisibility.name,
            { id },
            meshPointsVisibility(id),
          )
        },
      },
    )
  }

  function meshPointsActiveColoring(id) {
    return meshPointsStyle(id).coloring.active
  }
  function setMeshPointsActiveColoring(id, type) {
    const coloring = meshPointsStyle(id).coloring
    coloring.active = type
    console.log(
      setMeshPointsActiveColoring.name,
      { id },
      meshPointsActiveColoring(id),
    )
    if (type == "color") {
      return dataStyleStore.setMeshPointsColor(id, coloring.color)
    } else if (type == "vertex" && coloring.vertex !== null) {
      return dataStyleStore.setMeshPointsVertexAttribute(id, coloring.vertex)
    } else {
      throw new Error("Unknown mesh points coloring type: " + type)
    }
  }

  function meshPointsColor(id) {
    return meshPointsStyle(id).coloring.color
  }
  function setMeshPointsColor(id, color) {
    const coloring_style = meshPointsStyle(id).coloring
    return viewerStore.request(
      mesh_points_schemas.color,
      { id, color },
      {
        response_function: () => {
          coloring_style.color = color
          console.log(
            setMeshPointsColor.name,
            { id },
            JSON.stringify(meshPointsColor(id)),
          )
        },
      },
    )
  }
  function meshPointsVertexAttribute(id) {
    return meshPointsStyle(id).coloring.vertex
  }
  function setMeshPointsVertexAttribute(id, vertex_attribute) {
    const coloring_style = meshPointsStyle(id).coloring
    return viewerStore.request(
      mesh_points_schemas.vertex_attribute,
      { id, ...vertex_attribute },
      {
        response_function: () => {
          coloring_style.vertex = vertex_attribute
          console.log(
            setMeshPointsVertexAttribute.name,
            { id },
            meshPointsVertexAttribute(id),
          )
        },
      },
    )
  }

  function meshPointsSize(id) {
    return meshPointsStyle(id).size
  }
  function setMeshPointsSize(id, size) {
    return viewerStore.request(
      mesh_points_schemas.size,
      { id, size },
      {
        response_function: () => {
          meshPointsStyle(id).size = size
          console.log(setMeshPointsSize.name, { id }, meshPointsSize(id))
        },
      },
    )
  }

  function applyMeshPointsStyle(id) {
    const style = meshPointsStyle(id)
    return Promise.all([
      setMeshPointsVisibility(id, style.visibility),
      setMeshPointsActiveColoring(id, style.coloring.active),
      setMeshPointsSize(id, style.size),
    ])
  }

  return {
    meshPointsVisibility,
    meshPointsActiveColoring,
    meshPointsColor,
    meshPointsVertexAttribute,
    meshPointsSize,
    setMeshPointsVisibility,
    setMeshPointsActiveColoring,
    setMeshPointsColor,
    setMeshPointsVertexAttribute,
    setMeshPointsSize,
    applyMeshPointsStyle,
  }
}
