// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local constants
const mesh_polygons_schemas = viewer_schemas.opengeodeweb_viewer.mesh.polygons

export function useMeshPolygonsStyle() {
  const dataStyleStore = useDataStyleStore()

  function meshPolygonsStyle(id) {
    return dataStyleStore.getStyle(id).polygons
  }

  function meshPolygonsVisibility(id) {
    return meshPolygonsStyle(id).visibility
  }
  function setMeshPolygonsVisibility(id, visibility) {
    const polygons_style = meshPolygonsStyle(id)
    return viewer_call(
      { schema: mesh_polygons_schemas.visibility, params: { id, visibility } },
      {
        response_function: () => {
          polygons_style.visibility = visibility
          console.log(
            setMeshPolygonsVisibility.name,
            { id },
            meshPolygonsVisibility(id),
          )
        },
      },
    )
  }

  function meshPolygonsColor(id) {
    return meshPolygonsStyle(id).coloring.color
  }
  function setMeshPolygonsColor(id, color) {
    const coloring_style = meshPolygonsStyle(id).coloring
    return viewer_call(
      { schema: mesh_polygons_schemas.color, params: { id, color } },
      {
        response_function: () => {
          coloring_style.color = color
          console.log(
            setMeshPolygonsColor.name,
            { id },
            JSON.stringify(meshPolygonsColor(id)),
          )
        },
      },
    )
  }

  function meshPolygonsTextures(id) {
    return meshPolygonsStyle(id).coloring.textures
  }
  function setMeshPolygonsTextures(id, textures) {
    const coloring_style = meshPolygonsStyle(id).coloring
    return viewer_call(
      {
        schema: mesh_polygons_schemas.apply_textures,
        params: { id, textures },
      },
      {
        response_function: () => {
          coloring_style.textures = textures
          console.log(
            setMeshPolygonsTextures.name,
            { id },
            meshPolygonsTextures(id),
          )
        },
      },
    )
  }

  function meshPolygonsVertexAttribute(id) {
    return meshPolygonsStyle(id).coloring.vertex
  }

  function setMeshPolygonsVertexAttribute(id, vertex_attribute) {
    const coloring_style = meshPolygonsStyle(id).coloring
    return viewer_call(
      {
        schema: mesh_polygons_schemas.vertex_attribute,
        params: { id, ...vertex_attribute },
      },
      {
        response_function: () => {
          coloring_style.vertex = vertex_attribute
          console.log(
            setMeshPolygonsVertexAttribute.name,
            { id },
            meshPolygonsVertexAttribute(id),
          )
        },
      },
    )
  }

  function meshPolygonsPolygonAttribute(id) {
    return meshPolygonsStyle(id).coloring.polygon
  }
  function setMeshPolygonsPolygonAttribute(id, polygon_attribute) {
    const coloring_style = meshPolygonsStyle(id).coloring
    return viewer_call(
      {
        schema: mesh_polygons_schemas.polygon_attribute,
        params: { id, ...polygon_attribute },
      },
      {
        response_function: () => {
          coloring_style.polygon = polygon_attribute
          console.log(
            setMeshPolygonsPolygonAttribute.name,
            { id },
            meshPolygonsPolygonAttribute(id),
          )
        },
      },
    )
  }

  function meshPolygonsActiveColoring(id) {
    return meshPolygonsStyle(id).coloring.active
  }
  function setMeshPolygonsActiveColoring(id, type) {
    const coloring = meshPolygonsStyle(id).coloring
    coloring.active = type
    console.log(
      setMeshPolygonsActiveColoring.name,
      { id },
      meshPolygonsActiveColoring(id),
    )
    if (type === "color") {
      return setMeshPolygonsColor(id, coloring.color)
    } else if (type === "textures" && coloring.textures !== null) {
      return setMeshPolygonsTextures(id, coloring.textures)
    } else if (type === "vertex" && coloring.vertex !== null) {
      return setMeshPolygonsVertexAttribute(id, coloring.vertex)
    } else if (type === "polygon" && coloring.polygon !== null) {
      return setMeshPolygonsPolygonAttribute(id, coloring.polygon)
    } else {
      throw new Error("Unknown mesh polygons coloring type: " + type)
    }
  }

  function applyMeshPolygonsStyle(id, style) {
    return Promise.all([
      setMeshPolygonsVisibility(id, style.visibility),
      setMeshPolygonsActiveColoring(id, style.coloring.active),
    ])
  }

  return {
    meshPolygonsVisibility,
    meshPolygonsActiveColoring,
    meshPolygonsColor,
    meshPolygonsTextures,
    meshPolygonsPolygonAttribute,
    meshPolygonsVertexAttribute,
    setMeshPolygonsVisibility,
    setMeshPolygonsActiveColoring,
    setMeshPolygonsColor,
    setMeshPolygonsTextures,
    setMeshPolygonsVertexAttribute,
    setMeshPolygonsPolygonAttribute,
    applyMeshPolygonsStyle,
  }
}
