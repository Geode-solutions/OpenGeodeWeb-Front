// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStyleStateStore } from "../data_style_state"
import { useViewerStore } from "@ogw_front/stores/viewer"
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer"
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"
import { ensureAttributeEntry } from "./utils"

// Local constants
const mesh_polygons_schemas = viewer_schemas.opengeodeweb_viewer.mesh.polygons

export function useMeshPolygonsStyle() {
  const dataStyleStateStore = useDataStyleStateStore()
  const viewerStore = useViewerStore()
  const hybridViewerStore = useHybridViewerStore()

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

  function meshPolygonsVertexAttributeName(id) {
    const vertex = meshPolygonsStyle(id).coloring.vertex
    return vertex ? vertex.name : ""
  }
  function setMeshPolygonsVertexAttributeName(id, name) {
    const coloring_style = meshPolygonsStyle(id).coloring
    return viewerStore.request(
      mesh_polygons_schemas.attribute.vertex.name,
      { id, name },
      {
        response_function: () => {
          const saved_preset = coloring_style.vertex.attributes[name]
          coloring_style.vertex.name = name

          let minimum, maximum, colorMap
          if (
            saved_preset &&
            saved_preset.minimum !== undefined &&
            saved_preset.maximum !== undefined
          ) {
            minimum = saved_preset.minimum
            maximum = saved_preset.maximum
            colorMap = saved_preset.colorMap
            setMeshPolygonsVertexAttributeRange(id, minimum, maximum)
            setMeshPolygonsVertexAttributeColorMap(
              id,
              colorMap,
              minimum,
              maximum,
            )
          }
          console.log(
            setMeshPolygonsVertexAttributeName.name,
            { id },
            meshPolygonsVertexAttributeName(id),
          )
        },
      },
    )
  }
  function meshPolygonsVertexAttributeRange(id) {
    const name = meshPolygonsVertexAttributeName(id)
    const saved_preset = meshPolygonsStyle(id).coloring.vertex.attributes[name]
    return saved_preset ? [saved_preset.minimum, saved_preset.maximum] : [0, 1]
  }
  function setMeshPolygonsVertexAttributeRange(id, minimum, maximum) {
    const coloring_style = meshPolygonsStyle(id).coloring
    const name = coloring_style.vertex.name
    ensureAttributeEntry(coloring_style.vertex, name)
    const saved_preset = coloring_style.vertex.attributes[name]
    saved_preset.minimum = minimum
    saved_preset.maximum = maximum
    return viewerStore.request(
      mesh_polygons_schemas.attribute.vertex.scalar_range,
      { id, minimum, maximum },
      {
        response_function: () => {
          console.log(
            setMeshPolygonsVertexAttributeRange.name,
            { id },
            meshPolygonsVertexAttributeRange(id),
          )
        },
      },
    )
  }
  function meshPolygonsVertexAttributeColorMap(id) {
    const name = meshPolygonsVertexAttributeName(id)
    const saved_preset = meshPolygonsStyle(id).coloring.vertex.attributes[name]
    return saved_preset ? saved_preset.colorMap : null
  }
  function setMeshPolygonsVertexAttributeColorMap(
    id,
    colorMapName,
    minimum,
    maximum,
  ) {
    const coloring_style = meshPolygonsStyle(id).coloring
    const name = coloring_style.vertex.name
    ensureAttributeEntry(coloring_style.vertex, name)
    const saved_preset = coloring_style.vertex.attributes[name]
    saved_preset.colorMap = colorMapName
    const points =
      typeof colorMapName === "string"
        ? getRGBPointsFromPreset(colorMapName)
        : colorMapName
    return viewerStore.request(
      mesh_polygons_schemas.attribute.vertex.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          hybridViewerStore.remoteRender()
          console.log(setMeshPolygonsVertexAttributeColorMap.name, {
            id,
            colorMapName: meshPolygonsVertexAttributeColorMap(id),
          })
        },
      },
    )
  }

  function meshPolygonsPolygonAttributeName(id) {
    const polygon = meshPolygonsStyle(id).coloring.polygon
    return polygon ? polygon.name : ""
  }
  function setMeshPolygonsPolygonAttributeName(id, name) {
    const coloring_style = meshPolygonsStyle(id).coloring
    return viewerStore.request(
      mesh_polygons_schemas.attribute.polygon.name,
      { id, name },
      {
        response_function: () => {
          const saved_preset = coloring_style.polygon.attributes[name]
          coloring_style.polygon.name = name

          let minimum, maximum, colorMap
          if (
            saved_preset &&
            saved_preset.minimum !== undefined &&
            saved_preset.maximum !== undefined
          ) {
            minimum = saved_preset.minimum
            maximum = saved_preset.maximum
            colorMap = saved_preset.colorMap
            setMeshPolygonsPolygonAttributeRange(id, minimum, maximum)
            setMeshPolygonsPolygonAttributeColorMap(
              id,
              colorMap,
              minimum,
              maximum,
            )
          }
          console.log(
            setMeshPolygonsPolygonAttributeName.name,
            { id },
            meshPolygonsPolygonAttributeName(id),
          )
        },
      },
    )
  }
  function meshPolygonsPolygonAttributeRange(id) {
    const name = meshPolygonsPolygonAttributeName(id)
    const saved_preset = meshPolygonsStyle(id).coloring.polygon.attributes[name]
    return saved_preset ? [saved_preset.minimum, saved_preset.maximum] : [0, 1]
  }
  function setMeshPolygonsPolygonAttributeRange(id, minimum, maximum) {
    const coloring_style = meshPolygonsStyle(id).coloring
    const name = coloring_style.polygon.name
    ensureAttributeEntry(coloring_style.polygon, name)
    const saved_preset = coloring_style.polygon.attributes[name]
    saved_preset.minimum = minimum
    saved_preset.maximum = maximum
    return viewerStore.request(
      mesh_polygons_schemas.attribute.polygon.scalar_range,
      { id, minimum, maximum },
      {
        response_function: () => {
          console.log(
            setMeshPolygonsPolygonAttributeRange.name,
            { id },
            meshPolygonsPolygonAttributeRange(id),
          )
        },
      },
    )
  }
  function meshPolygonsPolygonAttributeColorMap(id) {
    const name = meshPolygonsPolygonAttributeName(id)
    const saved_preset = meshPolygonsStyle(id).coloring.polygon.attributes[name]
    return saved_preset ? saved_preset.colorMap : null
  }
  function setMeshPolygonsPolygonAttributeColorMap(
    id,
    colorMapName,
    minimum,
    maximum,
  ) {
    const coloring_style = meshPolygonsStyle(id).coloring
    const name = coloring_style.polygon.name
    ensureAttributeEntry(coloring_style.polygon, name)
    const saved_preset = coloring_style.polygon.attributes[name]
    saved_preset.colorMap = colorMapName
    const points =
      typeof colorMapName === "string"
        ? getRGBPointsFromPreset(colorMapName)
        : colorMapName
    return viewerStore.request(
      mesh_polygons_schemas.attribute.polygon.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          hybridViewerStore.remoteRender()
          console.log(setMeshPolygonsPolygonAttributeColorMap.name, {
            id,
            colorMapName: meshPolygonsPolygonAttributeColorMap(id),
          })
        },
      },
    )
  }

  function meshPolygonsActiveColoring(id) {
    return meshPolygonsStyle(id).coloring.active
  }
  async function setMeshPolygonsActiveColoring(id, type) {
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
      const name = coloring.vertex.name
      if (name === undefined) {
        return Promise.resolve()
      }
      const attributes = coloring.vertex.attributes
      const minimum = attributes[name]?.minimum
      const maximum = attributes[name]?.maximum
      const colorMap = attributes[name]?.colorMap
      await setMeshPolygonsVertexAttributeName(id, name)
      if (minimum !== undefined && maximum !== undefined) {
        await setMeshPolygonsVertexAttributeRange(id, minimum, maximum)
        if (colorMap) {
          await setMeshPolygonsVertexAttributeColorMap(
            id,
            colorMap,
            minimum,
            maximum,
          )
        }
      }
    } else if (type === "polygon") {
      const name = coloring.polygon.name
      if (name === undefined) {
        return Promise.resolve()
      }
      const attributes = coloring.polygon.attributes
      const minimum = attributes[name]?.minimum
      const maximum = attributes[name]?.maximum
      const colorMap = attributes[name]?.colorMap
      await setMeshPolygonsPolygonAttributeName(id, name)
      if (minimum !== undefined && maximum !== undefined) {
        await setMeshPolygonsPolygonAttributeRange(id, minimum, maximum)
        if (colorMap) {
          await setMeshPolygonsPolygonAttributeColorMap(
            id,
            colorMap,
            minimum,
            maximum,
          )
        }
      }
    } else {
      throw new Error("Unknown mesh polygons active coloring type: " + type)
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
    meshPolygonsVertexAttributeName,
    meshPolygonsVertexAttributeRange,
    meshPolygonsVertexAttributeColorMap,
    meshPolygonsPolygonAttributeName,
    meshPolygonsPolygonAttributeRange,
    meshPolygonsPolygonAttributeColorMap,
    setMeshPolygonsVisibility,
    setMeshPolygonsActiveColoring,
    setMeshPolygonsColor,
    setMeshPolygonsTextures,
    setMeshPolygonsVertexAttributeName,
    setMeshPolygonsVertexAttributeRange,
    setMeshPolygonsVertexAttributeColorMap,
    setMeshPolygonsPolygonAttributeName,
    setMeshPolygonsPolygonAttributeRange,
    setMeshPolygonsPolygonAttributeColorMap,
    applyMeshPolygonsStyle,
  }
}
