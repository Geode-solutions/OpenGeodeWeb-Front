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
  function setMeshPolygonsVertexAttributeName(
    id,
    name,
    defaultMin,
    defaultMax,
  ) {
    const coloring_style = meshPolygonsStyle(id).coloring
    return viewerStore.request(
      mesh_polygons_schemas.attribute.vertex.name,
      { id, name },
      {
        response_function: () => {
          if (!coloring_style.vertex) {
            coloring_style.vertex = {}
          }
          const previousName = coloring_style.vertex.name
          if (previousName) {
            if (!coloring_style.vertex.attributes) {
              coloring_style.vertex.attributes = {}
            }
            coloring_style.vertex.attributes[previousName] = {
              minimum: coloring_style.vertex.minimum,
              maximum: coloring_style.vertex.maximum,
              colorMap: coloring_style.vertex.colorMap,
            }
          }

          coloring_style.vertex.name = name

          if (
            coloring_style.vertex.attributes &&
            coloring_style.vertex.attributes[name]
          ) {
            const saved = coloring_style.vertex.attributes[name]
            if (saved.minimum !== undefined && saved.maximum !== undefined) {
              setMeshPolygonsVertexAttributeRange(
                id,
                saved.minimum,
                saved.maximum,
              )
              if (saved.colorMap) {
                setMeshPolygonsVertexAttributeColorMap(
                  id,
                  saved.colorMap,
                  saved.minimum,
                  saved.maximum,
                )
              }
            }
          } else if (defaultMin !== undefined && defaultMax !== undefined) {
            setMeshPolygonsVertexAttributeRange(id, defaultMin, defaultMax)
            setMeshPolygonsVertexAttributeColorMap(
              id,
              "Cool to Warm",
              defaultMin,
              defaultMax,
            )
          }
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
      mesh_polygons_schemas.attribute.vertex.scalar_range,
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
    colorMapName,
    minimum,
    maximum,
  ) {
    const coloring_style = meshPolygonsStyle(id).coloring
    let points = colorMapName
    if (typeof colorMapName === "string") {
      points = getRGBPointsFromPreset(colorMapName)
    }
    return viewerStore.request(
      mesh_polygons_schemas.attribute.vertex.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          if (!coloring_style.vertex) {
            coloring_style.vertex = {}
          }
          coloring_style.vertex.colorMap = colorMapName
          console.log(setMeshPolygonsVertexAttributeColorMap.name, {
            id,
            colorMapName,
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
  function setMeshPolygonsPolygonAttributeName(
    id,
    name,
    defaultMin,
    defaultMax,
  ) {
    const coloring_style = meshPolygonsStyle(id).coloring
    return viewerStore.request(
      mesh_polygons_schemas.attribute.polygon.name,
      { id, name },
      {
        response_function: () => {
          if (!coloring_style.polygon) {
            coloring_style.polygon = {}
          }
          const previousName = coloring_style.polygon.name
          if (previousName) {
            if (!coloring_style.polygon.attributes) {
              coloring_style.polygon.attributes = {}
            }
            coloring_style.polygon.attributes[previousName] = {
              minimum: coloring_style.polygon.minimum,
              maximum: coloring_style.polygon.maximum,
              colorMap: coloring_style.polygon.colorMap,
            }
          }

          coloring_style.polygon.name = name

          if (
            coloring_style.polygon.attributes &&
            coloring_style.polygon.attributes[name]
          ) {
            const saved = coloring_style.polygon.attributes[name]
            if (saved.minimum !== undefined && saved.maximum !== undefined) {
              setMeshPolygonsPolygonAttributeRange(
                id,
                saved.minimum,
                saved.maximum,
              )
              if (saved.colorMap) {
                setMeshPolygonsPolygonAttributeColorMap(
                  id,
                  saved.colorMap,
                  saved.minimum,
                  saved.maximum,
                )
              }
            }
          } else if (defaultMin !== undefined && defaultMax !== undefined) {
            setMeshPolygonsPolygonAttributeRange(id, defaultMin, defaultMax)
            setMeshPolygonsPolygonAttributeColorMap(
              id,
              "Cool to Warm",
              defaultMin,
              defaultMax,
            )
          }
          console.log(setMeshPolygonsPolygonAttributeName.name, { id }, name)
        },
      },
    )
  }
  function meshPolygonsPolygonAttributeRange(id) {
    const polygon = meshPolygonsStyle(id).coloring.polygon
    return polygon ? [polygon.minimum, polygon.maximum] : [0, 1]
  }
  function setMeshPolygonsPolygonAttributeRange(id, min, max) {
    const coloring_style = meshPolygonsStyle(id).coloring
    return viewerStore.request(
      mesh_polygons_schemas.attribute.polygon.scalar_range,
      { id, minimum: min, maximum: max },
      {
        response_function: () => {
          if (!coloring_style.polygon) {
            coloring_style.polygon = {}
          }
          coloring_style.polygon.minimum = min
          coloring_style.polygon.maximum = max
          console.log(setMeshPolygonsPolygonAttributeRange.name, {
            id,
            min,
            max,
          })
        },
      },
    )
  }
  function meshPolygonsPolygonAttributeColorMap(id) {
    const polygon = meshPolygonsStyle(id).coloring.polygon
    return polygon ? polygon.colorMap : null
  }
  function setMeshPolygonsPolygonAttributeColorMap(
    id,
    colorMapName,
    minimum,
    maximum,
  ) {
    const coloring_style = meshPolygonsStyle(id).coloring
    let points = colorMapName
    if (typeof colorMapName === "string") {
      points = getRGBPointsFromPreset(colorMapName)
    }
    return viewerStore.request(
      mesh_polygons_schemas.attribute.polygon.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          if (!coloring_style.polygon) {
            coloring_style.polygon = {}
          }
          coloring_style.polygon.colorMap = colorMapName
          console.log(setMeshPolygonsPolygonAttributeColorMap.name, {
            id,
            colorMapName,
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
        return Promise.resolve()
      }
      return setMeshPolygonsTextures(id, coloring.textures)
    } else if (type === "vertex") {
      if (coloring.vertex?.name === undefined) {
        return Promise.resolve()
      }
      return setMeshPolygonsVertexAttributeName(id, coloring.vertex.name).then(
        () => {
          if (
            coloring.vertex.minimum !== undefined &&
            coloring.vertex.maximum !== undefined
          ) {
            return setMeshPolygonsVertexAttributeRange(
              id,
              coloring.vertex.minimum,
              coloring.vertex.maximum,
            ).then(() => {
              if (coloring.vertex.colorMap) {
                return setMeshPolygonsVertexAttributeColorMap(
                  id,
                  coloring.vertex.colorMap,
                  coloring.vertex.minimum,
                  coloring.vertex.maximum,
                )
              }
            })
          }
        },
      )
    } else if (type === "polygon") {
      if (coloring.polygon?.name === undefined) {
        return Promise.resolve()
      }
      return setMeshPolygonsPolygonAttributeName(
        id,
        coloring.polygon.name,
      ).then(() => {
        if (
          coloring.polygon.minimum !== undefined &&
          coloring.polygon.maximum !== undefined
        ) {
          return setMeshPolygonsPolygonAttributeRange(
            id,
            coloring.polygon.minimum,
            coloring.polygon.maximum,
          ).then(() => {
            if (coloring.polygon.colorMap) {
              return setMeshPolygonsPolygonAttributeColorMap(
                id,
                coloring.polygon.colorMap,
                coloring.polygon.minimum,
                coloring.polygon.maximum,
              )
            }
          })
        }
      })
    } else {
      return Promise.resolve()
    }
  }

  function applyMeshPolygonsStyle(id) {
    const style = meshPolygonsStyle(id)
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
