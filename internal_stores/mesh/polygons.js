import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"
const mesh_polygons_schemas = viewer_schemas.opengeodeweb_viewer.mesh.polygons

export function useMeshPolygonsStyle() {
  const dataStyleStore = useDataStyleStore()

  function polygonsStyle(id) {
    return dataStyleStore.getStyle(id).polygons
  }

  function polygonsVisibility(id) {
    return polygonsStyle(id).visibility
  }
  function setPolygonsVisibility(id, visibility) {
    const polygons_style = polygonsStyle(id)
    return viewer_call(
      { schema: mesh_polygons_schemas.visibility, params: { id, visibility } },
      {
        response_function: () => {
          polygons_style.visibility = visibility
          console.log(
            `${setPolygonsVisibility.name} ${id} ${polygonsVisibility(id)}`,
          )
        },
      },
    )
  }
  function polygonsActiveColoring(id) {
    return polygonsStyle(id).coloring.active
  }
  function setPolygonsActiveColoring(id, type) {
    const coloring = polygonsStyle(id).coloring
    if (type == "color") {
      setPolygonsColor(id, coloring.color)
    } else if (type == "textures" && coloring.textures !== null) {
      setPolygonsTextures(id, coloring.textures)
    } else if (type == "vertex" && coloring.vertex !== null) {
      setPolygonsVertexAttribute(id, coloring.vertex)
    } else if (type == "polygon" && coloring.polygon !== null) {
      setPolygonsPolygonAttribute(id, coloring.polygon)
    } else throw new Error("Unknown polygons coloring type: " + type)
    coloring.active = type
    console.log(
      `${setPolygonsActiveColoring.name} ${id} ${polygonsActiveColoring(id)}`,
    )
  }

  function polygonsColor(id) {
    return polygonsStyle(id).coloring.color
  }
  function setPolygonsColor(id, color) {
    const coloring_style = polygonsStyle(id).coloring
    return viewer_call(
      { schema: mesh_polygons_schemas.color, params: { id, color } },
      {
        response_function: () => {
          coloring_style.color = color
          console.log(
            `${setPolygonsColor.name} ${id} ${JSON.stringify(polygonsColor(id))}`,
          )
        },
      },
    )
  }

  function polygonsTextures(id) {
    return polygonsStyle(id).coloring.textures
  }
  function setPolygonsTextures(id, textures) {
    const coloring_style = polygonsStyle(id).coloring
    return viewer_call(
      {
        schema: mesh_polygons_schemas.apply_textures,
        params: { id, textures },
      },
      {
        response_function: () => {
          coloring_style.textures = textures
          console.log(
            `${setPolygonsTextures.name} ${id} ${polygonsTextures(id)}`,
          )
        },
      },
    )
  }

  function polygonsVertexAttribute(id) {
    return polygonsStyle(id).coloring.vertex
  }

  function setPolygonsVertexAttribute(id, vertex_attribute) {
    const coloring_style = polygonsStyle(id).coloring
    return viewer_call(
      {
        schema: mesh_polygons_schemas.vertex_attribute,
        params: { id, ...vertex_attribute },
      },
      {
        response_function: () => {
          coloring_style.vertex = vertex_attribute
          console.log(
            `${setPolygonsVertexAttribute.name} ${id} ${polygonsVertexAttribute(id)}`,
          )
        },
      },
    )
  }

  function polygonsPolygonAttribute(id) {
    return polygonsStyle(id).coloring.polygon
  }
  function setPolygonsPolygonAttribute(id, polygon_attribute) {
    const coloring_style = polygonsStyle(id).coloring
    return viewer_call(
      {
        schema: mesh_polygons_schemas.polygon_attribute,
        params: { id, ...polygon_attribute },
      },
      {
        response_function: () => {
          coloring_style.polygon = polygon_attribute
          console.log(
            `${setPolygonsPolygonAttribute.name} ${id} ${polygonsPolygonAttribute(id)}`,
          )
        },
      },
    )
  }

  function applyPolygonsStyle(id, style) {
    return Promise.all([
      setPolygonsVisibility(id, style.visibility),
      setPolygonsActiveColoring(id, style.coloring.active),
    ])
  }

  return {
    polygonsVisibility,
    polygonsActiveColoring,
    polygonsColor,
    polygonsTextures,
    polygonsPolygonAttribute,
    polygonsVertexAttribute,
    setPolygonsVisibility,
    setPolygonsActiveColoring,
    setPolygonsColor,
    setPolygonsTextures,
    setPolygonsVertexAttribute,
    setPolygonsPolygonAttribute,
    applyPolygonsStyle,
  }
}
