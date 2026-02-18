// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"
import { useMeshCellsCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const meshCellsCellAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.cells.attribute.cell

export function useMeshCellsCellAttributeStyle() {
  const viewerStore = useViewerStore()
  const meshCellsCommonStyle = useMeshCellsCommonStyle()

  function meshCellsCellAttribute(id) {
    return meshCellsCommonStyle.meshCellsColoring(id).cell
  }

  async function updateMeshCellsCellAttribute(id) {
    const name = meshCellsCellAttributeName(id)
    const storedConfig = meshCellsCellAttributeStoredConfig(id, name)
    await meshCellsCellAttributeRange(
      id,
      storedConfig.minimum,
      storedConfig.maximum,
    )
    await meshCellsCellAttributeColorMap(id, storedConfig.colorMap)
  }

  function meshCellsCellAttributeStoredConfig(id, name) {
    const { storedConfigs } = meshCellsCellAttribute(id)
    if (name in storedConfigs) {
      return storedConfigs[name]
    }
    return setMeshCellsCellAttributeStoredConfig(id, name, {
      minimum: 0,
      maximum: 1,
      colorMap: "Cool to Warm",
      isAutoSet: false,
    })
  }

  function setMeshCellsCellAttributeStoredConfig(
    id,
    name,
    { minimum, maximum, colorMap, isAutoSet },
  ) {
    const storedConfigs = meshCellsCellAttribute(id).storedConfigs
    storedConfigs[name] = { minimum, maximum, colorMap, isAutoSet }
    return storedConfigs[name]
  }

  function meshCellsCellAttributeName(id) {
    console.log(
      meshCellsCellAttributeName.name,
      { id },
      meshCellsCellAttribute(id),
    )
    return meshCellsCellAttribute(id).name
  }
  function setMeshCellsCellAttributeName(id, name) {
    console.log(setMeshCellsCellAttributeName.name, { id, name })
    meshCellsCellAttribute(id).name = name
    return viewerStore.request(
      meshCellsCellAttributeSchemas.name,
      { id, name },
      {
        response_function: async () => {
          const { minimum, maximum } =
            meshCellsCellAttributeStoredConfig(id, name)
          await setMeshCellsCellAttributeRange(id, minimum, maximum)
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
    const storedConfig = meshCellsCellAttributeStoredConfig(id, name)
    const { minimum, maximum } = storedConfig
    return [minimum, maximum]
  }
  function setMeshCellsCellAttributeRange(id, minimum, maximum) {
    const name = meshCellsCellAttributeName(id)
    const storedConfig = meshCellsCellAttributeStoredConfig(id, name)
    storedConfig.minimum = minimum
    storedConfig.maximum = maximum
    storedConfig.isAutoSet = true
    return setMeshCellsCellAttributeColorMap(id, storedConfig.colorMap)
  }

  function meshCellsCellAttributeColorMap(id) {
    const name = meshCellsCellAttributeName(id)
    const storedConfig = meshCellsCellAttributeStoredConfig(id, name)
    const { colorMap } = storedConfig
    return colorMap
  }
  function setMeshCellsCellAttributeColorMap(id, colorMap) {
    const name = meshCellsCellAttributeName(id)
    const storedConfig = meshCellsCellAttributeStoredConfig(id, name)
    const points = getRGBPointsFromPreset(colorMap)
    const { minimum, maximum } = storedConfig

    console.log(setMeshCellsCellAttributeColorMap.name, {
      id,
      minimum,
      maximum,
      colorMap,
    })
    return viewerStore.request(
      meshCellsCellAttributeSchemas.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          storedConfig.colorMap = colorMap
          console.log(
            setMeshCellsCellAttributeColorMap.name,
            { id },
            meshCellsCellAttributeColorMap(id),
          )
        },
      },
    )
  }

  return {
    meshCellsCellAttributeName,
    meshCellsCellAttributeRange,
    meshCellsCellAttributeColorMap,
    meshCellsCellAttributeStoredConfig,
    setMeshCellsCellAttributeName,
    setMeshCellsCellAttributeRange,
    setMeshCellsCellAttributeColorMap,
    updateMeshCellsCellAttribute,
  }
}
