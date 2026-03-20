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


  function setMeshCellsCellAttributeStoredConfig(id, name, config) {
    return meshCellsCommonStyle.mutateMeshCellsCellStyle(id, {
      storedConfigs: {
        [name]: config,
      },
    })
  }

  function meshCellsCellAttributeName(id) {
    return meshCellsCellAttribute(id).name
  }

  function setMeshCellsCellAttributeName(id, name) {
    return viewerStore.request(
      meshCellsCellAttributeSchemas.name,
      { id, name },
      {
        response_function: () => {
          return meshCellsCommonStyle.mutateMeshCellsCellStyle(id, { name })
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
    return setMeshCellsCellAttributeStoredConfig(id, name, { minimum, maximum })
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
    return viewerStore.request(
      meshCellsCellAttributeSchemas.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          return setMeshCellsCellAttributeStoredConfig(id, name, { colorMap })
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
