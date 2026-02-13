// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStyleStateStore } from "../data_style_state"
import { useViewerStore } from "@ogw_front/stores/viewer"

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
    return viewerStore.request(
      mesh_cells_schemas.visibility,
      { id, visibility },
      {
        response_function: () => {
          meshCellsStyle(id).visibility = visibility
          console.log(
            setMeshCellsVisibility.name,
            { id },
            meshCellsVisibility(id),
          )
        },
      },
    )
  }

  function meshCellsColoring(id) {
    return meshCellsStyle(id).coloring
  }

  function meshCellsColor(id) {
    return meshCellsColoring(id).color
  }
  function setMeshCellsColor(id, color) {
    const meshCellsColoringStyle = meshCellsColoring(id)
    return viewerStore.request(
      mesh_cells_schemas.color,
      { id, color },
      {
        response_function: () => {
          meshCellsColoringStyle.color = color
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
    return meshCellsColoring(id).textures
  }
  function setMeshCellsTextures(id, textures) {
    const meshCellsColoringStyle = meshCellsColoring(id)
    return viewerStore.request(
      mesh_cells_schemas.apply_textures,
      { id, textures },
      {
        response_function: () => {
          meshCellsColoringStyle.textures = textures
          console.log(
            setMeshCellsTextures.name,
            { id },
            JSON.stringify(meshCellsTextures(id)),
          )
        },
      },
    )
  }

  function meshCellsVertexAttribute(id) {
    return meshCellsColoring(id).vertex
  }

  function meshCellsVertexAttributeStoredConfig(id, name) {
    const storedConfigs = meshCellsVertexAttribute(id).storedConfigs
    if (name in storedConfigs) {
      return storedConfigs[name]
    }

    return undefined
  }

  function setMeshCellsVertexStoredConfig(
    id,
    name,
    { minimum, maximum, colorMap },
  ) {
    const storedConfigs = meshCellsVertexAttributeStoredConfig(id).storedConfigs
    storedConfigs[name] = { minimum, maximum, colorMap }
  }

  function meshCellsVertexAttributeName(id) {
    return meshCellsVertexAttribute(id).name
  }
  function setMeshCellsVertexAttributeName(id, name) {
    const meshCellsColoringStyle = meshCellsColoring(id)
    return viewerStore.request(
      mesh_cells_schemas.attribute.vertex.name,
      { id, name },
      {
        response_function: () => {
          const storedConfig = meshCellsVertexStoredConfig(id, name)
          meshCellsColoringStyle.vertex.name = name

          if (storedConfig !== undefined) {
            const { minimum, maximum, colorMap } = storedConfig
            setMeshCellsVertexAttributeRange(id, minimum, maximum)
            setMeshCellsVertexAttributeColorMap(id, colorMap)
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
    const storedConfig = meshCellsVertexStoredConfig(id, name)
    let minimum, maximum
    if (!storedConfig) (minimum = 0), (maximum = 1)
    else {
      minimum = storedConfig.minimum
      maximum = storedConfig.maximum
    }
    return { minimum, maximum }
  }

  function setMeshCellsVertexAttributeRange(id, minimum, maximum) {
    const name = meshCellsVertexAttributeName(id)
    setMeshCellsVertexStoredConfig(id, name, { minimum, maximum })
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
    const { colorMap } = meshCellsVertexStoredConfig(id, name)
    return colorMap
  }
  function setMeshCellsVertexAttributeColorMap(id, colorMap, minimum, maximum) {
    const name = meshCellsVertexAttributeName(id)
    const points = getRGBPointsFromPreset(colorMap)
    return viewerStore.request(
      mesh_cells_schemas.attribute.vertex.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          setMeshCellsVertexStoredConfig(id, name, {
            minimum,
            maximum,
            colorMap,
          })
          console.log(
            setMeshCellsVertexAttributeColorMap.name,
            {
              id,
            },
            meshCellsVertexAttributeColorMap(id),
          )
        },
      },
    )
  }

  function meshCellsCellAttribute(id) {
    return meshCellsColoring(id).cell
  }

  function meshCellsCellAttributeStoredConfig(id, name) {
    const storedConfigs = meshCellsCellAttribute(id).storedConfigs
    if (name in storedConfigs) {
      return storedConfigs[name]
    }
    return setMeshCellsCellAttributeStoredConfig(id, name, {
      minimum: 0,
      maximum: 1,
      colorMap: "Cool to Warm",
    })
  }

  function setMeshCellsCellAttributeStoredConfig(
    id,
    name,
    { minimum, maximum, colorMap },
  ) {
    const storedConfigs = meshCellsCellAttribute(id).storedConfigs
    storedConfigs[name] = { minimum, maximum, colorMap }
    return storedConfigs[name]
  }

  function meshCellsCellAttributeName(id) {
    return meshCellsStyle(id).coloring.cell.name
  }
  function setMeshCellsCellAttributeName(id, name) {
    return viewerStore.request(
      mesh_cells_schemas.attribute.cell.name,
      { id, name },
      {
        response_function: async () => {
          meshCellsCellAttribute(id).name = name
          const storedConfig = meshCellsCellAttributeStoredConfig(id, name)
          const { minimum, maximum, colorMap } = storedConfig
          await setMeshCellsCellAttributeRange(id, minimum, maximum)
          setMeshCellsCellAttributeColorMap(id, colorMap)

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
    const storedConfig = meshCellsCellStoredConfig(id, name)
    let minimum, maximum
    if (!storedConfig) (minimum = 0), (maximum = 1)
    else {
      minimum = storedConfig.minimum
      maximum = storedConfig.maximum
    }
    return { minimum, maximum }
  }

  function setMeshCellsCellAttributeRange(id, minimum, maximum) {
    const storedConfig = meshCellsCellStoredConfig(
      id,
      meshCellsCellAttributeName(id),
    )
    return viewerStore.request(
      mesh_cells_schemas.attribute.cell.scalar_range,
      { id, minimum, maximum },
      {
        response_function: () => {
          storedConfig.minimum = minimum
          storedConfig.maximum = maximum
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
    const storedConfigs = meshCellsStyle(id).coloring.cell.storedConfigs[name]
    return storedConfigs ? storedConfigs.colorMap : null
  }
  function setMeshCellsCellAttributeColorMap(id, colorMap) {
    const storedConfig = meshCellsCellStoredConfig(
      id,
      meshCellsCellAttributeName(id),
    )
    const points = getRGBPointsFromPreset(colorMap)
    const { minimum, maximum } = meshCellsCellAttributeRange(id)
    return viewerStore.request(
      mesh_cells_schemas.attribute.cell.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          storedConfig.colorMap = colorMap
          console.log(
            setMeshCellsCellAttributeColorMap.name,
            {
              id,
            },
            meshCellsCellAttributeColorMap(id),
          )
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
      return setMeshCellsColor(id, meshCellsColor(id))
    } else if (type === "textures") {
      const name = meshCellsTextures(id).name
      if (name === null) {
        return Promise.resolve()
      }
      return setMeshCellsTextures(id, meshCellsTextures(id))
    } else if (type === "vertex") {
      const name = coloring.vertex.name
      if (name === undefined) {
        return Promise.resolve()
      }
      const storedConfig = coloring.vertex.storedConfigs[name]
      const { minimum, maximum, colorMap } = storedConfig
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
      const storedConfig = coloring.cell.storedConfigs[name]
      const { minimum, maximum, colorMap } = storedConfig
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
    return Promise.all([
      setMeshCellsVisibility(id, meshCellsVisibility(id)),
      setMeshCellsActiveColoring(id, meshCellsActiveColoring(id)),
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
