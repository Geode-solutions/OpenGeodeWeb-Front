import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"
const mesh_edges_schemas = viewer_schemas.opengeodeweb_viewer.mesh.edges

export function useMeshEdgesStyle() {
  const dataStyleStore = useDataStyleStore()

  function edgesStyle(id) {
    return dataStyleStore.getStyle(id).edges
  }

  function edgesVisibility(id) {
    return edgesStyle(id).visibility
  }
  function setEdgesVisibility(id, visibility) {
    const edges_style = edgesStyle(id)
    return viewer_call(
      { schema: mesh_edges_schemas.visibility, params: { id, visibility } },
      {
        response_function: () => {
          edges_style.visibility = visibility
          console.log(
            `${setEdgesVisibility.name} ${id} ${setEdgesVisibility(id)}`,
          )
        },
      },
    )
  }

  function edgesActiveColoring(id) {
    return edgesStyle(id).coloring.active
  }
  function setEdgesActiveColoring(id, type) {
    const coloring = edgesStyle(id).coloring
    coloring.active = type
    console.log(
      `${setEdgesActiveColoring.name} ${id} ${edgesActiveColoring(id)}`,
    )
    if (type === "color") {
      return setEdgesColor(id, coloring.color)
      // } else if (type == "vertex" && coloring.vertex !== null) {
      //   return setEdgesVertexAttribute(id, coloring.vertex)
      // } else if (type == "edges" && coloring.edges !== null) {
      //   return setEdgesEdgeAttribute(id, coloring.edges)
    } else throw new Error("Unknown edges coloring type: " + type)
  }

  function edgesColor(id) {
    return edgesStyle(id).coloring.color
  }
  function setEdgesColor(id, color) {
    const coloring_style = edgesStyle(id).coloring
    return viewer_call(
      { schema: mesh_edges_schemas.color, params: { id, color } },
      {
        response_function: () => {
          coloring_style.color = color
          console.log(
            `${setEdgesColor.name} ${id} ${JSON.stringify(edgesColor(id))}`,
          )
        },
      },
    )
  }

  function edgesWidth(id) {
    return edgesStyle(id).size
  }
  function setEdgesWidth(id, width) {
    const edges_style = edgesStyle(id)
    return viewer_call(
      { schema: mesh_edges_schemas.width, params: { id, width } },
      {
        response_function: () => {
          edges_style.width = width
          console.log(`${setEdgesWidth.name} ${id} ${edgesWidth(id)}`)
        },
      },
    )
  }

  function applyEdgesStyle(id, style) {
    return Promise.all([
      setEdgesVisibility(id, style.visibility),
      setEdgesActiveColoring(id, style.coloring.active),
      // setEdgesWidth(id, style.width);
    ])
  }

  return {
    applyEdgesStyle,
    edgesActiveColoring,
    edgesColor,
    edgesVisibility,
    edgesWidth,
    setEdgesActiveColoring,
    setEdgesColor,
    setEdgesVisibility,
    setEdgesWidth,
  }
}
