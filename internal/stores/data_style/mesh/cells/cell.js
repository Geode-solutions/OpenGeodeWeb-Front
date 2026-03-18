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

  function meshCellsCellAttributeStoredConfig(id, name) {
    const { storedConfigs } = meshCellsCellAttribute(id)
    if (name in storedConfigs) {
      return storedConfigs[name]
    }
    return setMeshCellsCellAttributeStoredConfig(id, name, {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    })
  }

  function mutateMeshCellsCellStyle(id, mutationCallback) {
    return meshCellsCommonStyle.mutateMeshCellsColoringStyle(id, (coloring) => {
      mutationCallback(coloring.cell)
    })
  }

  function setMeshCellsCellAttributeStoredConfig(
    id,
    name,
    { minimum, maximum, colorMap },
  ) {
    return mutateMeshCellsCellStyle(id, (cell) => {
      cell.storedConfigs[name] = {
        minimum,
        maximum,
        colorMap,
      }
    })
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
    return viewerStore.request(
      meshCellsCellAttributeSchemas.name,
      { id, name },
      {
        response_function: () => {
          return mutateMeshCellsCellStyle(id, (cell) => {
            cell.name = name
            const { minimum, maximum, colorMap } = cell.storedConfigs[name]
            const storedConfig = cell.storedConfigs[name]
            storedConfig.minimum = minimum
            storedConfig.maximum = maximum
            cell.storedConfigs[name].colorMap = colorMap
            console.log(setMeshCellsCellAttributeName.name, { id }, name)
          })
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
    return mutateMeshCellsCellStyle(id, (cell) => {
      const storedConfig = cell.storedConfigs[name]
      storedConfig.minimum = minimum
      storedConfig.maximum = maximum
      // Also update color map synchronously in the same mutation
      const colorMap = cell.storedConfigs[name].colorMap
      cell.storedConfigs[name].colorMap = colorMap
    })
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
          return mutateMeshCellsCellStyle(id, (cell) => {
            cell.storedConfigs[name].colorMap = colorMap
            console.log(
              setMeshCellsCellAttributeColorMap.name,
              { id },
              cell.storedConfigs[name].colorMap,
            )
          })
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
  }
}
