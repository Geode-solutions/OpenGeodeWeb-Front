// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStyleStateStore } from "../data_style_state"
import { useViewerStore } from "@ogw_front/stores/viewer"
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"
import { ensureAttributeEntry } from "./utils"

// Local constants
const mesh_cells_schemas = viewer_schemas.opengeodeweb_viewer.mesh.cells

export function useMeshCellsStyle() {
  const dataStyleStateStore = useDataStyleStateStore()
  const viewerStore = useViewerStore()

  function meshCellsStyle(id) {
    return dataStyleStateStore.getStyle(id).cells
  }

  function meshCellsVisibility(id) {
    return meshCellsStyle(id).visibility
  }
  function setMeshCellsVisibility(id, visibility) {
    const cells_style = meshCellsStyle(id)
    return viewerStore.request(
      mesh_cells_schemas.visibility,
      { id, visibility },
      {
        response_function: () => {
          cells_style.visibility = visibility
          console.log(
            setMeshCellsVisibility.name,
            { id },
            meshCellsVisibility(id),
          )
        },
      },
    )
  }

  function meshCellsColor(id) {
    return meshCellsStyle(id).coloring.color
  }
  function setMeshCellsColor(id, color) {
    const coloring_style = meshCellsStyle(id).coloring
    return viewerStore.request(
      mesh_cells_schemas.color,
      { id, color },
      {
        response_function: () => {
          coloring_style.color = color
          console.log(
            setMeshCellsColor.name,
            { id },
            JSON.stringify(meshCellsColor(id)),
          )
        },
      },
    )
  }

  function meshCellsTextures(id) {
    return meshCellsStyle(id).coloring.textures
  }
  function setMeshCellsTextures(id, textures) {
    const coloring_style = meshCellsStyle(id).coloring
    return viewerStore.request(
      mesh_cells_schemas.apply_textures,
      { id, textures },
      {
        response_function: () => {
          coloring_style.textures = textures
          console.log(setMeshCellsTextures.name, { id }, meshCellsTextures(id))
        },
      },
    )
  }

  function meshCellsVertexAttributeName(id) {
    const vertex = meshCellsStyle(id).coloring.vertex
    return vertex ? vertex.name : ""
  }
  function setMeshCellsVertexAttributeName(id, name) {
    const coloring_style = meshCellsStyle(id).coloring
    return viewerStore.request(
      mesh_cells_schemas.attribute.vertex.name,
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
            setMeshCellsVertexAttributeRange(id, minimum, maximum)
            setMeshCellsVertexAttributeColorMap(id, colorMap, minimum, maximum)
          }
          console.log(
            setMeshCellsVertexAttributeName.name,
            { id },
            meshCellsVertexAttributeName(id),
          )
        },
      },
    )
  }
  function meshCellsVertexAttributeRange(id) {
    const name = meshCellsVertexAttributeName(id)
    const saved_preset = meshCellsStyle(id).coloring.vertex.attributes[name]
    return saved_preset ? [saved_preset.minimum, saved_preset.maximum] : [0, 1]
  }
  function setMeshCellsVertexAttributeRange(id, minimum, maximum) {
    const coloring_style = meshCellsStyle(id).coloring
    const name = coloring_style.vertex.name
    ensureAttributeEntry(coloring_style.vertex, name)
    const saved_preset = coloring_style.vertex.attributes[name]
    saved_preset.minimum = minimum
    saved_preset.maximum = maximum
    return viewerStore.request(
      mesh_cells_schemas.attribute.vertex.scalar_range,
      { id, minimum, maximum },
      {
        response_function: () => {
          console.log(
            setMeshCellsVertexAttributeRange.name,
            { id },
            meshCellsVertexAttributeRange(id),
          )
        },
      },
    )
  }
  function meshCellsVertexAttributeColorMap(id) {
    const name = meshCellsVertexAttributeName(id)
    const saved_preset = meshCellsStyle(id).coloring.vertex.attributes[name]
    return saved_preset ? saved_preset.colorMap : null
  }
  function setMeshCellsVertexAttributeColorMap(
    id,
    colorMapName,
    minimum,
    maximum,
  ) {
    const coloring_style = meshCellsStyle(id).coloring
    const name = coloring_style.vertex.name
    ensureAttributeEntry(coloring_style.vertex, name)
    const saved_preset = coloring_style.vertex.attributes[name]
    saved_preset.colorMap = colorMapName
    const points =
      typeof colorMapName === "string"
        ? getRGBPointsFromPreset(colorMapName)
        : colorMapName
    return viewerStore.request(
      mesh_cells_schemas.attribute.vertex.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          console.log(setMeshCellsVertexAttributeColorMap.name, {
            id,
            colorMapName: meshCellsVertexAttributeColorMap(id),
          })
        },
      },
    )
  }

  function meshCellsCellAttributeName(id) {
    return meshCellsStyle(id).coloring.cell?.name ?? ""
  }
  function setMeshCellsCellAttributeName(id, name) {
    const coloring_style = meshCellsStyle(id).coloring
    return viewerStore.request(
      mesh_cells_schemas.attribute.cell.name,
      { id, name },
      {
        response_function: () => {
          const saved_preset = coloring_style.cell.attributes[name]
          coloring_style.cell.name = name

          let minimum, maximum, colorMap
          if (
            saved_preset &&
            saved_preset.minimum !== undefined &&
            saved_preset.maximum !== undefined
          ) {
            minimum = saved_preset.minimum
            maximum = saved_preset.maximum
            colorMap = saved_preset.colorMap
            setMeshCellsCellAttributeRange(id, minimum, maximum)
            setMeshCellsCellAttributeColorMap(id, colorMap, minimum, maximum)
          }
          console.log(
            setMeshCellsCellAttributeName.name,
            { id },
            meshCellsCellAttributeName(id),
          )
        },
      },
    )
  }
  function meshCellsCellAttributeRange(id) {
    const name = meshCellsCellAttributeName(id)
    const saved_preset = meshCellsStyle(id).coloring.cell.attributes[name]
    return saved_preset ? [saved_preset.minimum, saved_preset.maximum] : [0, 1]
  }
  function setMeshCellsCellAttributeRange(id, minimum, maximum) {
    const coloring_style = meshCellsStyle(id).coloring
    const name = coloring_style.cell.name
    ensureAttributeEntry(coloring_style.cell, name)
    const saved_preset = coloring_style.cell.attributes[name]
    saved_preset.minimum = minimum
    saved_preset.maximum = maximum
    return viewerStore.request(
      mesh_cells_schemas.attribute.cell.scalar_range,
      { id, minimum, maximum },
      {
        response_function: () => {
          console.log(
            setMeshCellsCellAttributeRange.name,
            { id },
            meshCellsCellAttributeRange(id),
          )
        },
      },
    )
  }
  function meshCellsCellAttributeColorMap(id) {
    const name = meshCellsCellAttributeName(id)
    const saved_preset = meshCellsStyle(id).coloring.cell.attributes[name]
    return saved_preset ? saved_preset.colorMap : null
  }
  function setMeshCellsCellAttributeColorMap(
    id,
    colorMapName,
    minimum,
    maximum,
  ) {
    const coloring_style = meshCellsStyle(id).coloring
    const name = coloring_style.cell.name
    ensureAttributeEntry(coloring_style.cell, name)
    const saved_preset = coloring_style.cell.attributes[name]
    saved_preset.colorMap = colorMapName
    const points =
      typeof colorMapName === "string"
        ? getRGBPointsFromPreset(colorMapName)
        : colorMapName
    return viewerStore.request(
      mesh_cells_schemas.attribute.cell.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          console.log(setMeshCellsCellAttributeColorMap.name, {
            id,
            colorMapName: meshCellsCellAttributeColorMap(id),
          })
        },
      },
    )
  }

  function meshCellsActiveColoring(id) {
    return meshCellsStyle(id).coloring.active
  }
  async function setMeshCellsActiveColoring(id, type) {
    const coloring = meshCellsStyle(id).coloring
    coloring.active = type
    console.log(
      setMeshCellsActiveColoring.name,
      { id },
      meshCellsActiveColoring(id),
    )
    if (type === "color") {
      return setMeshCellsColor(id, coloring.color)
    } else if (type === "textures") {
      if (coloring.textures === null) {
        return Promise.resolve()
      }
      return setMeshCellsTextures(id, coloring.textures)
    } else if (type === "vertex") {
      const name = coloring.vertex.name
      if (name === undefined) {
        return Promise.resolve()
      }
      const attributes = coloring.vertex.attributes
      const minimum = attributes[name]?.minimum
      const maximum = attributes[name]?.maximum
      const colorMap = attributes[name]?.colorMap
      await setMeshCellsVertexAttributeName(id, name)
      if (minimum !== undefined && maximum !== undefined) {
        await setMeshCellsVertexAttributeRange(id, minimum, maximum)
        if (colorMap) {
          await setMeshCellsVertexAttributeColorMap(
            id,
            colorMap,
            minimum,
            maximum,
          )
        }
      }
    } else if (type === "cell") {
      const name = coloring.cell.name
      if (name === undefined) {
        return Promise.resolve()
      }
      const attributes = coloring.cell.attributes
      const minimum = attributes[name]?.minimum
      const maximum = attributes[name]?.maximum
      const colorMap = attributes[name]?.colorMap
      await setMeshCellsCellAttributeName(id, name)
      if (minimum !== undefined && maximum !== undefined) {
        await setMeshCellsCellAttributeRange(id, minimum, maximum)
        if (colorMap) {
          await setMeshCellsCellAttributeColorMap(
            id,
            colorMap,
            minimum,
            maximum,
          )
        }
      }
    } else {
      throw new Error("Unknown mesh cells coloring type: " + type)
    }
  }

  function applyMeshCellsStyle(id) {
    const style = meshCellsStyle(id)
    return Promise.all([
      setMeshCellsVisibility(id, style.visibility),
      setMeshCellsActiveColoring(id, style.coloring.active),
    ])
  }

  return {
    meshCellsVisibility,
    meshCellsActiveColoring,
    meshCellsColor,
    meshCellsTextures,
    meshCellsVertexAttributeName,
    meshCellsVertexAttributeRange,
    meshCellsVertexAttributeColorMap,
    meshCellsCellAttributeName,
    meshCellsCellAttributeRange,
    meshCellsCellAttributeColorMap,
    setMeshCellsVisibility,
    setMeshCellsActiveColoring,
    setMeshCellsColor,
    setMeshCellsTextures,
    setMeshCellsVertexAttributeName,
    setMeshCellsVertexAttributeRange,
    setMeshCellsVertexAttributeColorMap,
    setMeshCellsCellAttributeName,
    setMeshCellsCellAttributeRange,
    setMeshCellsCellAttributeColorMap,
    applyMeshCellsStyle,
  }
}
