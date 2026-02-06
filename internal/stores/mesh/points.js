// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStyleStateStore } from "../data_style_state"
import { useViewerStore } from "@ogw_front/stores/viewer"
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"
import { ensureAttributeEntry } from "./utils"

// Local constants
const mesh_points_schemas = viewer_schemas.opengeodeweb_viewer.mesh.points

export function useMeshPointsStyle() {
  const dataStyleStateStore = useDataStyleStateStore()
  const viewerStore = useViewerStore()

  function meshPointsStyle(id) {
    return dataStyleStateStore.getStyle(id).points
  }

  function meshPointsVisibility(id) {
    return meshPointsStyle(id).visibility
  }
  function setMeshPointsVisibility(id, visibility) {
    const points_style = meshPointsStyle(id)
    return viewerStore.request(
      mesh_points_schemas.visibility,
      { id, visibility },
      {
        response_function: () => {
          points_style.visibility = visibility
          console.log(
            setMeshPointsVisibility.name,
            { id },
            meshPointsVisibility(id),
          )
        },
      },
    )
  }

  function meshPointsActiveColoring(id) {
    return meshPointsStyle(id).coloring.active
  }
  async function setMeshPointsActiveColoring(id, type) {
    const coloring = meshPointsStyle(id).coloring
    coloring.active = type
    console.log(
      setMeshPointsActiveColoring.name,
      { id },
      meshPointsActiveColoring(id),
    )
    if (type === "color") {
      return setMeshPointsColor(id, coloring.color)
    } else if (type === "vertex") {
      const name = coloring.vertex.name
      if (name === undefined) {
        return Promise.resolve()
      }
      const attributes = coloring.vertex.attributes
      const minimum = attributes[name]?.minimum
      const maximum = attributes[name]?.maximum
      const colorMap = attributes[name]?.colorMap
      await setMeshPointsVertexAttributeName(id, name)
      if (minimum !== undefined && maximum !== undefined) {
        await setMeshPointsVertexAttributeRange(id, minimum, maximum)
        if (colorMap) {
          await setMeshPointsVertexAttributeColorMap(
            id,
            colorMap,
            minimum,
            maximum,
          )
        }
      }
    } else {
      throw new Error("Unknown mesh points active coloring type: " + type)
    }
  }

  function meshPointsColor(id) {
    return meshPointsStyle(id).coloring.color
  }
  function setMeshPointsColor(id, color) {
    const coloring_style = meshPointsStyle(id).coloring
    return viewerStore.request(
      mesh_points_schemas.color,
      { id, color },
      {
        response_function: () => {
          coloring_style.color = color
          console.log(
            setMeshPointsColor.name,
            { id },
            JSON.stringify(meshPointsColor(id)),
          )
        },
      },
    )
  }
  function meshPointsVertexAttributeName(id) {
    return meshPointsStyle(id).coloring.vertex.name
  }
  function setMeshPointsVertexAttributeName(id, name) {
    const coloring_style = meshPointsStyle(id).coloring
    return viewerStore.request(
      mesh_points_schemas.attribute.vertex.name,
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
            setMeshPointsVertexAttributeRange(id, minimum, maximum)
            setMeshPointsVertexAttributeColorMap(id, colorMap, minimum, maximum)
          }

          console.log(
            setMeshPointsVertexAttributeName.name,
            { id },
            meshPointsVertexAttributeName(id),
          )
        },
      },
    )
  }
  function meshPointsVertexAttributeRange(id) {
    const name = meshPointsVertexAttributeName(id)
    const saved_preset = meshPointsStyle(id).coloring.vertex.attributes[name]
    return saved_preset ? [saved_preset.minimum, saved_preset.maximum] : [0, 1]
  }
  function setMeshPointsVertexAttributeRange(id, minimum, maximum) {
    const coloring_style = meshPointsStyle(id).coloring
    const name = coloring_style.vertex.name
    ensureAttributeEntry(coloring_style.vertex, name)
    const saved_preset = coloring_style.vertex.attributes[name]
    saved_preset.minimum = minimum
    saved_preset.maximum = maximum
    return viewerStore.request(
      mesh_points_schemas.attribute.vertex.scalar_range,
      { id, minimum, maximum },
      {
        response_function: () => {
          console.log(
            setMeshPointsVertexAttributeRange.name,
            { id },
            meshPointsVertexAttributeRange(id),
          )
        },
      },
    )
  }
  function meshPointsVertexAttributeColorMap(id) {
    const vertex = meshPointsStyle(id).coloring.vertex
    return vertex ? vertex.colorMap : null
  }
  function setMeshPointsVertexAttributeColorMap(
    id,
    colorMapName,
    minimum,
    maximum,
  ) {
    const coloring_style = meshPointsStyle(id).coloring
    const name = coloring_style.vertex.name
    ensureAttributeEntry(coloring_style.vertex, name)
    const saved_preset = coloring_style.vertex.attributes[name]
    saved_preset.colorMap = colorMapName
    const points =
      typeof colorMapName === "string"
        ? getRGBPointsFromPreset(colorMapName)
        : colorMapName
    return viewerStore.request(
      mesh_points_schemas.attribute.vertex.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          console.log(setMeshPointsVertexAttributeColorMap.name, {
            id,
            colorMapName: meshPointsVertexAttributeColorMap(id),
          })
        },
      },
    )
  }

  function meshPointsSize(id) {
    return meshPointsStyle(id).size
  }
  function setMeshPointsSize(id, size) {
    return viewerStore.request(
      mesh_points_schemas.size,
      { id, size },
      {
        response_function: () => {
          meshPointsStyle(id).size = size
          console.log(setMeshPointsSize.name, { id }, meshPointsSize(id))
        },
      },
    )
  }

  function applyMeshPointsStyle(id) {
    const style = meshPointsStyle(id)
    return Promise.all([
      setMeshPointsVisibility(id, style.visibility),
      setMeshPointsActiveColoring(id, style.coloring.active),
      setMeshPointsSize(id, style.size),
    ])
  }

  return {
    meshPointsVisibility,
    meshPointsActiveColoring,
    meshPointsColor,
    meshPointsVertexAttributeName,
    meshPointsVertexAttributeRange,
    meshPointsVertexAttributeColorMap,
    meshPointsSize,
    setMeshPointsVisibility,
    setMeshPointsActiveColoring,
    setMeshPointsColor,
    setMeshPointsVertexAttributeName,
    setMeshPointsVertexAttributeRange,
    setMeshPointsVertexAttributeColorMap,
    setMeshPointsSize,
    applyMeshPointsStyle,
  }
}
