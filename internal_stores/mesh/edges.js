import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"
const mesh_edges_schemas = viewer_schemas.opengeodeweb_viewer.mesh.edges

export function useMeshEdgesStyle() {
  const dataStyleStore = useDataStyleStore()

  function edgesVisibility(id) {
    return dataStyleStore.styles[id].edges.visibility
  }
  function setEdgesVisibility(id, visibility) {
    const edges_style = dataStyleStore.styles[id].edges
    return viewer_call(
      {
        schema: mesh_edges_schemas.visibility,
        params: { id, visibility },
      },
      {
        response_function: () => {
          edges_style.visibility = visibility
          console.log(`${setEdgesVisibility.name} ${edges_style.visibility}`)
        },
      },
    )
  }

  function edgesActiveColoring(id) {
    return dataStyleStore.styles[id].edges.coloring.active
  }
  async function setEdgesActiveColoring(id, type) {
    const coloring = dataStyleStore.styles[id].edges.coloring
    if (type == "color") {
      setEdgesColor(id, coloring.color)
      // else if (type == "vertex") {
      //   const vertex = coloring.vertex
      // if (vertex !== null) setEdgesVertexAttribute(id, vertex)
      // } else if (type == "edges") {
      //   const edges = coloring.edges
      //   if (edges !== null) setEdgesEdgeAttribute(id, edges)
    } else throw new Error("Unknown edges coloring type: " + type)
    coloring.active = type
    console.log(`${setEdgesActiveColoring.name} ${coloring.active}`)
  }

  function edgesColor(id) {
    return dataStyleStore.styles[id].edges.coloring.color
  }
  function setEdgesColor(id, color) {
    const coloring_style = dataStyleStore.styles[id].edges.coloring
    return viewer_call(
      {
        schema: mesh_edges_schemas.color,
        params: { id, color },
      },
      {
        response_function: () => {
          coloring_style.color = color
          console.log(
            `${setEdgesColor.name} ${JSON.stringify(coloring_style.color)}`,
          )
        },
      },
    )
  }

  function edgesWidth(id) {
    return dataStyleStore.styles[id].edges.size
  }
  function setEdgesWidth(id, width) {
    const edges_style = dataStyleStore.styles[id].edges
    return viewer_call(
      {
        schema: mesh_edges_schemas.width,
        params: { id, width },
      },
      {
        response_function: () => {
          edges_style.width = width
          console.log(`${setEdgesWidth.name} ${edges_style.width}`)
        },
      },
    )
  }

  async function applyEdgesStyle(id, style) {
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
