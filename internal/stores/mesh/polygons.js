// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStyleStateStore } from "../data_style_state"
import { useViewerStore } from "@ogw_front/stores/viewer"
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"

// Local constants
const mesh_polygons_schemas = viewer_schemas.opengeodeweb_viewer.mesh.polygons

export function useMeshPolygonsStyle() {
  const dataStyleStateStore = useDataStyleStateStore()
  const viewerStore = useViewerStore()

  function meshPolygonsStyle(id) {
    return dataStyleStateStore.getStyle(id).polygons
  }

  function meshPolygonsVisibility(id) {
    return meshPolygonsStyle(id).visibility
  }
  function setMeshPolygonsVisibility(id, visibility) {
    const polygons_style = meshPolygonsStyle(id)
    return viewerStore.request(
      mesh_polygons_schemas.visibility,
      { id, visibility },
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
    return viewerStore.request(
      mesh_polygons_schemas.color,
      { id, color },
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
    return viewerStore.request(
      mesh_polygons_schemas.apply_textures,
      { id, textures },
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
    return setMeshPolygonsVertexAttributeName(id, vertex_attribute.name)
  }
  function meshPolygonsVertexAttributeName(id) {
    const vertex = meshPolygonsStyle(id).coloring.vertex
    return vertex ? vertex.name : ""
  }
  function setMeshPolygonsVertexAttributeName(id, name) {
    const coloring_style = meshPolygonsStyle(id).coloring
    return viewerStore.request(
      mesh_polygons_schemas.vertex_attribute,
      { id, name },
      {
        response_function: () => {
          if (!coloring_style.vertex) {
            coloring_style.vertex = {}
          }
          coloring_style.vertex.name = name
          console.log(setMeshPolygonsVertexAttributeName.name, { id }, name)
        },
      },
    )
  }
  function meshPolygonsVertexAttributeRange(id) {
    const vertex = meshPolygonsStyle(id).coloring.vertex
    return vertex ? [vertex.minimum, vertex.maximum] : [0, 1]
  }
  function setMeshPolygonsVertexAttributeRange(id, min, max) {
    const coloring_style = meshPolygonsStyle(id).coloring
    return viewerStore.request(
      mesh_polygons_schemas.vertex_scalar_range,
      { id, minimum: min, maximum: max },
      {
        response_function: () => {
          if (!coloring_style.vertex) {
            coloring_style.vertex = {}
          }
          coloring_style.vertex.minimum = min
          coloring_style.vertex.maximum = max
          console.log(setMeshPolygonsVertexAttributeRange.name, {
            id,
            min,
            max,
          })
        },
      },
    )
  }
  function meshPolygonsVertexAttributeColorMap(id) {
    const vertex = meshPolygonsStyle(id).coloring.vertex
    return vertex ? vertex.colorMap : null
  }
  function setMeshPolygonsVertexAttributeColorMap(
    id,
    points,
    minimum,
    maximum,
  ) {
    const coloring_style = meshPolygonsStyle(id).coloring
    if (typeof points === "string") {
      points = getRGBPointsFromPreset(points)
    }
    return viewerStore.request(
      mesh_polygons_schemas.vertex_color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          if (!coloring_style.vertex) {
            coloring_style.vertex = {}
          }
          coloring_style.vertex.colorMap = points
          console.log(setMeshPolygonsVertexAttributeColorMap.name, {
            id,
            points,
          })
        },
      },
    )
  }

  function meshPolygonsPolygonAttribute(id) {
    return meshPolygonsStyle(id).coloring.polygon
  }
  function setMeshPolygonsPolygonAttribute(id, polygon_attribute) {
    return setMeshPolygonsPolygonAttributeName(id, polygon_attribute.name)
  }
  function meshPolygonsPolygonAttributeName(id) {
    const polygon = meshPolygonsStyle(id).coloring.polygon
    return polygon ? polygon.name : ""
  }
  function setMeshPolygonsPolygonAttributeName(id, name) {
    const coloring_style = meshPolygonsStyle(id).coloring
    return viewerStore.request(
      mesh_polygons_schemas.polygon_attribute,
      { id, name },
      {
        response_function: () => {
          if (!coloring_style.polygon) {
            coloring_style.polygon = {}
          }
          coloring_style.polygon.name = name
          console.log(setMeshPolygonsPolygonAttributeName.name, { id }, name)
        },
      },
    )
  }
  function meshPolygonsPolygonAttributeRange(id) {
    const polygon = meshPolygonsStyle(id).coloring.polygon
    return polygon ? [polygon.minimum, polygon.maximum] : [0, 1]
  }
  function setMeshPolygonsPolygonScalarRange(id, min, max) {
    const coloring_style = meshPolygonsStyle(id).coloring
    return viewerStore.request(
      mesh_polygons_schemas.polygon_scalar_range,
      { id, minimum: min, maximum: max },
      {
        response_function: () => {
          if (!coloring_style.polygon) {
            coloring_style.polygon = {}
          }
          coloring_style.polygon.minimum = min
          coloring_style.polygon.maximum = max
          console.log(setMeshPolygonsPolygonScalarRange.name, { id, min, max })
        },
      },
    )
  }
  function meshPolygonsPolygonAttributeColorMap(id) {
    const polygon = meshPolygonsStyle(id).coloring.polygon
    return polygon ? polygon.colorMap : null
  }
  function setMeshPolygonsPolygonColorMap(id, points, minimum, maximum) {
    const coloring_style = meshPolygonsStyle(id).coloring
    if (typeof points === "string") {
      points = getRGBPointsFromPreset(points)
    }
    return viewerStore.request(
      mesh_polygons_schemas.polygon_color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          if (!coloring_style.polygon) {
            coloring_style.polygon = {}
          }
          coloring_style.polygon.colorMap = points
          console.log(setMeshPolygonsPolygonColorMap.name, { id, points })
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
    } else if (type === "textures") {
      if (coloring.textures === null) {
        throw new Error("Textures not set")
      }
      return setMeshPolygonsTextures(id, coloring.textures)
    } else if (type === "vertex") {
      if (coloring.vertex && coloring.vertex.name) {
        return setMeshPolygonsVertexAttributeName(id, coloring.vertex.name)
      }
      return Promise.resolve()
    } else if (type === "polygon") {
      if (coloring.polygon && coloring.polygon.name) {
        return setMeshPolygonsPolygonAttributeName(id, coloring.polygon.name)
      }
      return Promise.resolve()
    } else {
      throw new Error("Unknown mesh polygons coloring type: " + type)
    }
  }

  function applyMeshPolygonsStyle(id) {
    const style = meshPolygonsStyle(id)
    const promises = [
      setMeshPolygonsVisibility(id, style.visibility),
      setMeshPolygonsActiveColoring(id, style.coloring.active),
    ]

    if (style.coloring.active === "vertex" && style.coloring.vertex) {
      const { name, minimum, maximum, colorMap } = style.coloring.vertex
      if (name) {
        promises.push(setMeshPolygonsVertexAttributeName(id, name))
      }
      if (minimum !== undefined && maximum !== undefined) {
        promises.push(setMeshPolygonsVertexAttributeRange(id, minimum, maximum))
        if (colorMap) {
          promises.push(
            setMeshPolygonsVertexAttributeColorMap(
              id,
              colorMap,
              minimum,
              maximum,
            ),
          )
        }
      }
    } else if (style.coloring.active === "polygon" && style.coloring.polygon) {
      const { name, minimum, maximum, colorMap } = style.coloring.polygon
      if (name) {
        promises.push(setMeshPolygonsPolygonAttributeName(id, name))
      }
      if (minimum !== undefined && maximum !== undefined) {
        promises.push(setMeshPolygonsPolygonScalarRange(id, minimum, maximum))
        if (colorMap) {
          promises.push(
            setMeshPolygonsPolygonColorMap(id, colorMap, minimum, maximum),
          )
        }
      }
    } else if (
      style.coloring.active === "textures" &&
      style.coloring.textures
    ) {
      promises.push(setMeshPolygonsTextures(id, style.coloring.textures))
    }

    return Promise.all(promises)
  }

  return {
    meshPolygonsVisibility,
    meshPolygonsActiveColoring,
    meshPolygonsColor,
    meshPolygonsTextures,
    meshPolygonsVertexAttribute,
    meshPolygonsVertexAttributeName,
    meshPolygonsVertexAttributeRange,
    meshPolygonsVertexAttributeColorMap,
    meshPolygonsPolygonAttribute,
    meshPolygonsPolygonAttributeName,
    meshPolygonsPolygonAttributeRange,
    meshPolygonsPolygonAttributeColorMap,
    setMeshPolygonsVisibility,
    setMeshPolygonsActiveColoring,
    setMeshPolygonsColor,
    setMeshPolygonsTextures,
    setMeshPolygonsVertexAttribute,
    setMeshPolygonsVertexAttributeName,
    setMeshPolygonsVertexAttributeRange,
    setMeshPolygonsVertexAttributeColorMap,
    setMeshPolygonsPolygonAttribute,
    setMeshPolygonsPolygonAttributeName,
    setMeshPolygonsPolygonAttributeRange,
    setMeshPolygonsPolygonAttributeColorMap,
    applyMeshPolygonsStyle,
  }
}
