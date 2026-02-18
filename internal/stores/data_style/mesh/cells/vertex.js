// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"
import { useMeshCellsCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const meshCellsVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.cells.attribute.vertex

export function useMeshCellsVertexAttributeStyle() {
  const viewerStore = useViewerStore()
  const meshCellsCommonStyle = useMeshCellsCommonStyle()

  function meshCellsVertexAttribute(id) {
    return meshCellsCommonStyle.meshCellsColoring(id).vertex
  }

  async function updateMeshCellsVertexAttribute(id) {
    const name = meshCellsVertexAttributeName(id)
    const storedConfig = meshCellsVertexAttributeStoredConfig(id, name)
    await meshCellsVertexAttributeRange(
      id,
      storedConfig.minimum,
      storedConfig.maximum,
    )
    await meshCellsVertexAttributeColorMap(id, storedConfig.colorMap)
  }

  function meshCellsVertexAttributeStoredConfig(id, name) {
    const { storedConfigs } = meshCellsVertexAttribute(id)
    if (name in storedConfigs) {
      return storedConfigs[name]
    }
    return setMeshCellsVertexAttributeStoredConfig(id, name, {
      minimum: 0,
      maximum: 1,
      colorMap: "Cool to Warm",
      isAutoSet: false,
    })
  }

  function setMeshCellsVertexAttributeStoredConfig(
    id,
    name,
    { minimum, maximum, colorMap, isAutoSet },
  ) {
    const storedConfigs = meshCellsVertexAttribute(id).storedConfigs
    storedConfigs[name] = { minimum, maximum, colorMap, isAutoSet }
    return storedConfigs[name]
  }

  function meshCellsVertexAttributeName(id) {
    console.log(
      meshCellsVertexAttributeName.name,
      { id },
      meshCellsVertexAttribute(id),
    )
    return meshCellsVertexAttribute(id).name
  }
  function setMeshCellsVertexAttributeName(id, name) {
    console.log(setMeshCellsVertexAttributeName.name, { id, name })
    meshCellsVertexAttribute(id).name = name
    return viewerStore.request(
      meshCellsVertexAttributeSchemas.name,
      { id, name },
      {
        response_function: async () => {
          const { minimum, maximum } =
            meshCellsVertexAttributeStoredConfig(id, name)
          await setMeshCellsVertexAttributeRange(id, minimum, maximum)
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
    const storedConfig = meshCellsVertexAttributeStoredConfig(id, name)
    const { minimum, maximum } = storedConfig
    return [minimum, maximum]
  }
  function setMeshCellsVertexAttributeRange(id, minimum, maximum) {
    const name = meshCellsVertexAttributeName(id)
    const storedConfig = meshCellsVertexAttributeStoredConfig(id, name)
    storedConfig.minimum = minimum
    storedConfig.maximum = maximum
    storedConfig.isAutoSet = true
    return setMeshCellsVertexAttributeColorMap(id, storedConfig.colorMap)
  }

  function meshCellsVertexAttributeColorMap(id) {
    const name = meshCellsVertexAttributeName(id)
    const storedConfig = meshCellsVertexAttributeStoredConfig(id, name)
    const { colorMap } = storedConfig
    return colorMap
  }
  function setMeshCellsVertexAttributeColorMap(id, colorMap) {
    const name = meshCellsVertexAttributeName(id)
    const storedConfig = meshCellsVertexAttributeStoredConfig(id, name)
    const points = getRGBPointsFromPreset(colorMap)
    const { minimum, maximum } = storedConfig

    console.log(setMeshCellsVertexAttributeColorMap.name, {
      id,
      minimum,
      maximum,
      colorMap,
    })
    return viewerStore.request(
      meshCellsVertexAttributeSchemas.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          storedConfig.colorMap = colorMap
          console.log(
            setMeshCellsVertexAttributeColorMap.name,
            { id },
            meshCellsVertexAttributeColorMap(id),
          )
        },
      },
    )
  }

  return {
    meshCellsVertexAttributeName,
    meshCellsVertexAttributeRange,
    meshCellsVertexAttributeColorMap,
    meshCellsVertexAttributeStoredConfig,
    setMeshCellsVertexAttributeName,
    setMeshCellsVertexAttributeRange,
    setMeshCellsVertexAttributeColorMap,
    updateMeshCellsVertexAttribute,
  }
}
