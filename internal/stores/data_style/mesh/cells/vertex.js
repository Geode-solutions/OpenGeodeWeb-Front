// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useViewerStore } from "@ogw_front/stores/viewer"
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"
import { useMeshCellsCommonStyle } from "./common"

// Local constants
const meshCellsVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.cells.attribute.vertex

export function useMeshCellsVertexAttributeStyle() {
  const viewerStore = useViewerStore()
  const meshCellsCommonStyle = useMeshCellsCommonStyle()

  function meshCellsVertexAttribute(id) {
    return meshCellsCommonStyle.meshCellsColoring(id).vertex
  }

  function meshCellsVertexAttributeStoredConfig(id, name) {
    const storedConfigs = meshCellsVertexAttribute(id).storedConfigs
    if (name in storedConfigs) {
      return storedConfigs[name]
    }
    return setMeshCellsVertexAttributeStoredConfig(id, name, {
      minimum: 0,
      maximum: 1,
      colorMap: "Cool to Warm",
    })
  }

  function setMeshCellsVertexAttributeStoredConfig(
    id,
    name,
    { minimum, maximum, colorMap },
  ) {
    const storedConfigs = meshCellsVertexAttribute(id).storedConfigs
    storedConfigs[name] = { minimum, maximum, colorMap }
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
    return viewerStore.request(
      meshCellsVertexAttributeSchemas.name,
      { id, name },
      {
        response_function: async () => {
          meshCellsVertexAttribute(id).name = name
          const { minimum, maximum, colorMap } =
            meshCellsVertexAttributeStoredConfig(id, name)
          await setMeshCellsVertexAttributeRange(id, minimum, maximum)
          await setMeshCellsVertexAttributeColorMap(id, colorMap)
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
    return viewerStore.request(
      meshCellsVertexAttributeSchemas.scalar_range,
      { id, minimum, maximum },
      {
        response_function: () => {
          storedConfig.minimum = minimum
          storedConfig.maximum = maximum
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
    setMeshCellsVertexAttributeName,
    setMeshCellsVertexAttributeRange,
    setMeshCellsVertexAttributeColorMap,
  }
}
