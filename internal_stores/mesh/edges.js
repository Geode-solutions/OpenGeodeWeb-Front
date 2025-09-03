import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"
const mesh_edges_schemas = viewer_schemas.opengeodeweb_viewer.mesh.edges

export function useMeshEdgesStyle() {
  /** State **/
  const dataStyleStore = useDataStyleStore()

  /** Getters **/
  function edgesVisibility(id) {
    return dataStyleStore.styles[id].edges.visibility
  }
  function edgesActiveColoring(id) {
    return dataStyleStore.styles[id].edges.coloring.active
  }
  function edgesColor(id) {
    return dataStyleStore.styles[id].edges.coloring.color
  }
  function edgesSize(id) {
    return dataStyleStore.styles[id].edges.size
  }

  /** Actions **/
  function setEdgesVisibility(id, visibility) {
    return viewer_call(
      {
        schema: mesh_edges_schemas.visibility,
        params: { id, visibility },
      },
      {
        response_function: () => {
          dataStyleStore.styles[id].edges.visibility = visibility
          console.log(
            "setEdgesVisibility",
            dataStyleStore.styles[id].edges.visibility,
          )
        },
      },
    )
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
    console.log("setEdgesActiveColoring", coloring.active)
  }

  function setEdgesColor(id, color) {
    return viewer_call(
      {
        schema: mesh_edges_schemas.color,
        params: { id, color },
      },
      {
        response_function: () => {
          console.log("response_function", id, color)
          dataStyleStore.styles[id].edges.coloring.color = color
          console.log(
            "setEdgesColor",
            dataStyleStore.styles[id].edges.coloring.color,
          )
        },
      },
    )
  }
  function setEdgesWidth(id, width) {
    return viewer_call(
      {
        schema: mesh_edges_schemas.width,
        params: { id, width },
      },
      {
        response_function: () => {
          dataStyleStore.styles[id].edges.width = width
          console.log("setEdgesWidth", dataStyleStore.styles[id].edges.width)
        },
      },
    )
  }

  function applyEdgesStyle(id, style) {
    setEdgesVisibility(id, style.visibility)
    setEdgesActiveColoring(id, style.coloring.active)
    // setEdgesWidth(id, style.size);
  }

  return {
    edgesVisibility,
    edgesActiveColoring,
    edgesColor,
    edgesSize,
    setEdgesVisibility,
    setEdgesActiveColoring,
    setEdgesColor,
    setEdgesWidth,
    applyEdgesStyle,
  }
}
