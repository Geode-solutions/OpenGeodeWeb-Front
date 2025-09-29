import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"
const mesh_points_schemas = viewer_schemas.opengeodeweb_viewer.mesh.points

export function useMeshPointsStyle() {
  const dataStyleStore = useDataStyleStore()

  function pointsStyle(id) {
    return dataStyleStore.getStyle(id).points
  }

  function pointsVisibility(id) {
    return pointsStyle(id).visibility
  }
  function setPointsVisibility(id, visibility) {
    const points_style = pointsStyle(id)
    return viewer_call(
      { schema: mesh_points_schemas.visibility, params: { id, visibility } },
      {
        response_function: () => {
          points_style.visibility = visibility
          console.log(`${setPointsVisibility.name} ${pointsVisibility(id)}`)
        },
      },
    )
  }

  function pointsActiveColoring(id) {
    return pointsStyle(id).coloring.active
  }
  function setPointsActiveColoring(id, type) {
    const coloring = pointsStyle(id).coloring
    if (type == "color") dataStyleStore.setPointsColor(id, coloring.color)
    else if (type == "vertex") {
      if (coloring.vertex !== null)
        dataStyleStore.setPointsVertexAttribute(id, coloring.vertex)
    } else throw new Error("Unknown points coloring type: " + type)
    coloring.active = type
    console.log(`${setPointsActiveColoring.name} ${pointsActiveColoring(id)}`)
  }

  function pointsColor(id) {
    return pointsStyle(id).coloring.color
  }
  function setPointsColor(id, color) {
    const coloring_style = pointsStyle(id).coloring
    return viewer_call(
      { schema: mesh_points_schemas.color, params: { id, color } },
      {
        response_function: () => {
          coloring_style.color = color
          console.log(
            `${setPointsColor.name} ${JSON.stringify(pointsColor(id))}`,
          )
        },
      },
    )
  }
  function pointsVertexAttribute(id) {
    return pointsStyle(id).coloring.vertex
  }
  function setPointsVertexAttribute(id, vertex_attribute) {
    const coloring_style = pointsStyle(id).coloring
    return viewer_call(
      {
        schema: mesh_points_schemas.vertex_attribute,
        params: { id, ...vertex_attribute },
      },
      {
        response_function: () => {
          coloring_style.vertex = vertex_attribute
          console.log(
            `${setPointsVertexAttribute.name} ${pointsVertexAttribute(id)}`,
          )
        },
      },
    )
  }

  function pointsSize(id) {
    return pointsStyle(id).size
  }
  function setPointsSize(id, size) {
    const points_style = pointsStyle(id)
    return viewer_call(
      { schema: mesh_points_schemas.size, params: { id, size } },
      {
        response_function: () => {
          points_style.size = size
          console.log(`${setPointsSize.name} ${pointsSize(id)}`)
        },
      },
    )
  }

  function applyPointsStyle(id, style) {
    return Promise.all([
      setPointsVisibility(id, style.visibility),
      setPointsActiveColoring(id, style.coloring.active),
      setPointsSize(id, style.size),
    ])
  }

  return {
    pointsVisibility,
    pointsActiveColoring,
    pointsColor,
    pointsVertexAttribute,
    pointsSize,
    setPointsVisibility,
    setPointsActiveColoring,
    setPointsColor,
    setPointsVertexAttribute,
    setPointsSize,
    applyPointsStyle,
  }
}

export default useMeshPointsStyle
