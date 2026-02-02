// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"
import vtkColorMaps from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps"

// Local imports
import { useDataStyleStateStore } from "../data_style_state"
import { useViewerStore } from "@ogw_front/stores/viewer"
import { convertRGBPointsToSchemaFormat } from "@ogw_front/utils/colormap"

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
    const coloring_style = meshPolygonsStyle(id).coloring
    const { name } = vertex_attribute
    return viewerStore.request(
      mesh_polygons_schemas.vertex_attribute,
      { id, name },
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
    const { name } = polygon_attribute
    return viewerStore.request(
      mesh_polygons_schemas.polygon_attribute,
      { id, name },
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

  function setMeshPolygonsPolygonScalarRange(id, minimum, maximum) {
    const polygons_style = meshPolygonsStyle(id)
    return viewerStore.request(
      mesh_polygons_schemas.polygon_scalar_range,
      { id, minimum, maximum },
      {
        response_function: () => {
          polygons_style.coloring.polygon.min = minimum
          polygons_style.coloring.polygon.max = maximum
          console.log(setMeshPolygonsPolygonScalarRange.name, {
            id,
            minimum,
            maximum,
          })
        },
      },
    )
  }

  function setMeshPolygonsVertexScalarRange(id, minimum, maximum) {
    const polygons_style = meshPolygonsStyle(id)
    return viewerStore.request(
      mesh_polygons_schemas.vertex_scalar_range,
      { id, minimum, maximum },
      {
        response_function: () => {
          polygons_style.coloring.vertex.min = minimum
          polygons_style.coloring.vertex.max = maximum
          console.log(setMeshPolygonsVertexScalarRange.name, {
            id,
            minimum,
            maximum,
          })
        },
      },
    )
  }

  function setMeshPolygonsVertexColorMap(id, points, minimum, maximum) {
    const polygons_style = meshPolygonsStyle(id)
    if (typeof points === "string") {
      const preset = vtkColorMaps.getPresetByName(points)
      if (preset && preset.RGBPoints) {
        points = convertRGBPointsToSchemaFormat(
          preset.RGBPoints,
          minimum,
          maximum,
        )
      } else {
        console.error("Invalid colormap preset:", points)
        return Promise.reject("Invalid colormap preset")
      }
    }
    return viewerStore.request(
      mesh_polygons_schemas.vertex_color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          polygons_style.coloring.vertex.colorMap = points
          console.log(setMeshPolygonsVertexColorMap.name, {
            id,
            points,
            minimum,
            maximum,
          })
        },
      },
    )
  }

  function setMeshPolygonsPolygonColorMap(id, points, minimum, maximum) {
    const polygons_style = meshPolygonsStyle(id)
    if (typeof points === "string") {
      const preset = vtkColorMaps.getPresetByName(points)
      if (preset && preset.RGBPoints) {
        points = convertRGBPointsToSchemaFormat(
          preset.RGBPoints,
          minimum,
          maximum,
        )
      } else {
        console.error("Invalid colormap preset:", points)
        return Promise.reject("Invalid colormap preset")
      }
    }
    return viewerStore.request(
      mesh_polygons_schemas.polygon_color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          polygons_style.coloring.polygon.colorMap = points
          console.log(setMeshPolygonsPolygonColorMap.name, {
            id,
            points,
            minimum,
            maximum,
          })
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
      if (coloring.vertex === null) {
        throw new Error("Vertex attribute not set")
      }
      return setMeshPolygonsVertexAttribute(id, coloring.vertex)
    } else if (type === "polygon") {
      if (coloring.polygon === null) {
        throw new Error("Polygon attribute not set")
      }
      return setMeshPolygonsPolygonAttribute(id, coloring.polygon)
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
      const { min, max, colorMap } = style.coloring.vertex
      if (min !== undefined && max !== undefined) {
        promises.push(setMeshPolygonsVertexScalarRange(id, min, max))
        if (colorMap) {
          promises.push(setMeshPolygonsVertexColorMap(id, colorMap, min, max))
        }
      }
    } else if (style.coloring.active === "polygon" && style.coloring.polygon) {
      const { min, max, colorMap } = style.coloring.polygon
      if (min !== undefined && max !== undefined) {
        promises.push(setMeshPolygonsPolygonScalarRange(id, min, max))
        if (colorMap) {
          promises.push(
            setMeshPolygonsPolygonColorMap(id, colorMap, min, max),
          )
        }
      }
    }

    return Promise.all(promises)
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
    setMeshPolygonsPolygonScalarRange,
    setMeshPolygonsVertexScalarRange,
    setMeshPolygonsVertexColorMap,
    setMeshPolygonsPolygonColorMap,
    applyMeshPolygonsStyle,
  }
}
