import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"
const mesh_polyhedra_schemas = viewer_schemas.opengeodeweb_viewer.mesh.polyhedra

export function useMeshPolyhedraStyle() {
  const dataStyleStore = useDataStyleStore()

  function polyhedraStyle(id) {
    return dataStyleStore.getStyle(id).polyhedra
  }

  function polyhedraVisibility(id) {
    return polyhedraStyle(id).visibility
  }
  function setPolyhedraVisibility(id, visibility) {
    const polyhedra_style = polyhedraStyle(id)
    return viewer_call(
      { schema: mesh_polyhedra_schemas.visibility, params: { id, visibility } },
      {
        response_function: () => {
          polyhedra_style.visibility = visibility
          console.log(`${setPolyhedraVisibility.name} ${polyhedra_style.color}`)
        },
      },
    )
  }
  function polyhedraActiveColoring(id) {
    return polyhedraStyle(id).coloring.active
  }
  function setPolyhedraActiveColoring(id, type) {
    const coloring = polyhedraStyle(id).coloring
    coloring.active = type
    console.log(
      `${setPolyhedraActiveColoring.name} ${polyhedraActiveColoring(id)}`,
    )
    if (type === "color") {
      return setPolyhedraColor(id, coloring.color)
    } else if (type === "vertex" && coloring.vertex !== null) {
      return setPolyhedraVertexAttribute(id, coloring.vertex)
    } else if (type === "polyhedron" && coloring.polyhedron !== null) {
      return setPolyhedraPolyhedronAttribute(id, coloring.polyhedron)
    } else throw new Error("Unknown polyhedra coloring type: " + type)
  }

  function polyhedraColor(id) {
    return polyhedraStyle(id).coloring.color
  }
  function setPolyhedraColor(id, color) {
    const coloring = polyhedraStyle(id).coloring
    return viewer_call(
      { schema: mesh_polyhedra_schemas.color, params: { id, color } },
      {
        response_function: () => {
          coloring.color = color
          console.log(`${setPolyhedraColor.name} ${polyhedraColor(id)}`)
        },
      },
    )
  }

  function polyhedraVertexAttribute(id) {
    return polyhedraStyle(id).coloring.vertex
  }
  function setPolyhedraVertexAttribute(id, vertex_attribute) {
    const coloring_style = polyhedraStyle(id).coloring
    return viewer_call(
      {
        schema: mesh_polyhedra_schemas.vertex_attribute,
        params: { id, ...vertex_attribute },
      },
      {
        response_function: () => {
          coloring_style.vertex = vertex_attribute
          console.log(
            `${setPolyhedraVertexAttribute.name} ${polyhedraVertexAttribute(id)}`,
          )
        },
      },
    )
  }
  function polyhedraPolygonAttribute(id) {
    return polyhedraStyle(id).coloring.polygon
  }

  function polyhedraPolyhedronAttribute(id) {
    return polyhedraStyle(id).coloring.polyhedron
  }
  function setPolyhedraPolyhedronAttribute(id, polyhedron_attribute) {
    const coloring = polyhedraStyle(id).coloring
    return viewer_call(
      {
        schema: mesh_polyhedra_schemas.polyhedron_attribute,
        params: { id, ...polyhedron_attribute },
      },
      {
        response_function: () => {
          coloring.polyhedron = polyhedron_attribute
          console.log(
            `${setPolyhedraPolyhedronAttribute.name} ${polyhedraPolyhedronAttribute(id)}`,
          )
        },
      },
    )
  }

  function applyPolyhedraStyle(id, style) {
    return Promise.all([
      setPolyhedraVisibility(id, style.visibility),
      setPolyhedraActiveColoring(id, style.coloring.active),
    ])
  }

  return {
    polyhedraVisibility,
    polyhedraActiveColoring,
    polyhedraColor,
    polyhedraVertexAttribute,
    polyhedraPolygonAttribute,
    polyhedraPolyhedronAttribute,
    setPolyhedraVisibility,
    setPolyhedraActiveColoring,
    setPolyhedraColor,
    setPolyhedraVertexAttribute,
    setPolyhedraPolyhedronAttribute,
    applyPolyhedraStyle,
  }
}
