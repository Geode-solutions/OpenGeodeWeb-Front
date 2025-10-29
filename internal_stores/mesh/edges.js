// Node.js imports

// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports

// Local constants
const mesh_edges_schemas = viewer_schemas.opengeodeweb_viewer.mesh.edges

export function useMeshEdgesStyle() {
  const dataStyleStore = useDataStyleStore()

  function meshEdgesStyle(id) {
    return dataStyleStore.getStyle(id).edges
  }

  function meshEdgesVisibility(id) {
    return meshEdgesStyle(id).visibility
  }
  function setMeshEdgesVisibility(id, visibility) {
    const mesh_edges_style = meshEdgesStyle(id)
    return viewer_call(
      { schema: mesh_edges_schemas.visibility, params: { id, visibility } },
      {
        response_function: () => {
          mesh_edges_style.visibility = visibility
          console.log(
            `${setMeshEdgesVisibility.name} ${id} ${meshEdgesVisibility(id)}`,
          )
        },
      },
    )
  }

  function meshEdgesActiveColoring(id) {
    return meshEdgesStyle(id).coloring.active
  }
  function setMeshEdgesActiveColoring(id, type) {
    const coloring = meshEdgesStyle(id).coloring
    coloring.active = type
    console.log(
      `${setMeshEdgesActiveColoring.name} ${id} ${meshEdgesActiveColoring(id)}`,
    )
    if (type === "color") {
      return setMeshEdgesColor(id, coloring.color)
      // } else if (type == "vertex" && coloring.vertex !== null) {
      //   return setEdgesVertexAttribute(id, coloring.vertex)
      // } else if (type == "edges" && coloring.edges !== null) {
      //   return setEdgesEdgeAttribute(id, coloring.edges)
    } else {
      throw new Error("Unknown mesh edges coloring type: " + type)
    }
  }

  function meshEdgesColor(id) {
    return meshEdgesStyle(id).coloring.color
  }
  function setMeshEdgesColor(id, color) {
    const coloring_style = meshEdgesStyle(id).coloring
    return viewer_call(
      { schema: mesh_edges_schemas.color, params: { id, color } },
      {
        response_function: () => {
          coloring_style.color = color
          console.log(
            `${setMeshEdgesColor.name} ${id} ${JSON.stringify(meshEdgesColor(id))}`,
          )
        },
      },
    )
  }

  function meshEdgesWidth(id) {
    return meshEdgesStyle(id).size
  }
  function setMeshEdgesWidth(id, width) {
    const edges_style = meshEdgesStyle(id)
    return viewer_call(
      { schema: mesh_edges_schemas.width, params: { id, width } },
      {
        response_function: () => {
          edges_style.width = width
          console.log(`${setMeshEdgesWidth.name} ${id} ${meshEdgesWidth(id)}`)
        },
      },
    )
  }

  function applyMeshEdgesStyle(id, style) {
    return Promise.all([
      setMeshEdgesVisibility(id, style.visibility),
      setMeshEdgesActiveColoring(id, style.coloring.active),
      // setMeshEdgesWidth(id, style.width);
    ])
  }

  return {
    applyMeshEdgesStyle,
    meshEdgesActiveColoring,
    meshEdgesColor,
    meshEdgesVisibility,
    meshEdgesWidth,
    setMeshEdgesActiveColoring,
    setMeshEdgesColor,
    setMeshEdgesVisibility,
    setMeshEdgesWidth,
  }
}
