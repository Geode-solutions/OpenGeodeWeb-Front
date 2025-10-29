// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local constants
const mesh_points_schemas = viewer_schemas.opengeodeweb_viewer.mesh.points

export function useMeshPointsStyle() {
  const dataStyleStore = useDataStyleStore()

  function meshPointsStyle(id) {
    return dataStyleStore.getStyle(id).points
  }

  function meshPointsVisibility(id) {
    return meshPointsStyle(id).visibility
  }
  function setMeshPointsVisibility(id, visibility) {
    const points_style = meshPointsStyle(id)
    return viewer_call(
      { schema: mesh_points_schemas.visibility, params: { id, visibility } },
      {
        response_function: () => {
          points_style.visibility = visibility
          console.log(
            `${setMeshPointsVisibility.name} ${id} ${meshPointsVisibility(id)}`,
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
      `${setMeshPointsActiveColoring.name} ${id} ${meshPointsActiveColoring(id)}`,
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
    return viewer_call(
      { schema: mesh_points_schemas.color, params: { id, color } },
      {
        response_function: () => {
          coloring_style.color = color
          console.log(
            `${setMeshPointsColor.name} ${id} ${JSON.stringify(meshPointsColor(id))}`,
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
    return viewer_call(
      {
        schema: mesh_points_schemas.vertex_attribute,
        params: { id, ...vertex_attribute },
      },
      {
        response_function: () => {
          coloring_style.vertex = vertex_attribute
          console.log(
            `${setMeshPointsVertexAttribute.name} ${id} ${meshPointsVertexAttribute(id)}`,
          )
        },
      },
    )
  }

  function meshPointsSize(id) {
    return meshPointsStyle(id).size
  }
  function setMeshPointsSize(id, size) {
    const points_style = meshPointsStyle(id)
    return viewer_call(
      { schema: mesh_points_schemas.size, params: { id, size } },
      {
        response_function: () => {
          points_style.size = size
          console.log(`${setMeshPointsSize.name} ${id} ${meshPointsSize(id)}`)
        },
      },
    )
  }

  function applyMeshPointsStyle(id, style) {
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
