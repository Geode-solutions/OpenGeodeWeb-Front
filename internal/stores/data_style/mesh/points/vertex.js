// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"
import { useMeshPointsCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const meshPointsVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.points.attribute.vertex

export function useMeshPointsVertexAttributeStyle() {
  const viewerStore = useViewerStore()
  const meshPointsCommonStyle = useMeshPointsCommonStyle()

  function meshPointsVertexAttribute(id) {
    return meshPointsCommonStyle.meshPointsColoring(id).vertex
  }

  async function updateMeshPointsVertexAttribute(id) {
    const name = meshPointsVertexAttributeName(id)
    const storedConfig = meshPointsVertexAttributeStoredConfig(id, name)
    await setMeshPointsVertexAttributeRange(
      id,
      storedConfig.minimum,
      storedConfig.maximum,
    )
    await setMeshPointsVertexAttributeColorMap(id, storedConfig.colorMap)
  }

  function meshPointsVertexAttributeStoredConfig(id, name) {
    const { storedConfigs } = meshPointsVertexAttribute(id)
    if (name in storedConfigs) {
      return storedConfigs[name]
    }
    return setMeshPointsVertexAttributeStoredConfig(id, name, {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    })
  }

  function setMeshPointsVertexAttributeStoredConfig(
    id,
    name,
    { minimum, maximum, colorMap },
  ) {
    const storedConfigs = meshPointsVertexAttribute(id).storedConfigs
    storedConfigs[name] = { minimum, maximum, colorMap }
    return storedConfigs[name]
  }

  function meshPointsVertexAttributeName(id) {
    console.log(
      meshPointsVertexAttributeName.name,
      { id },
      meshPointsVertexAttribute(id),
    )
    return meshPointsVertexAttribute(id).name
  }
  function setMeshPointsVertexAttributeName(id, name) {
    console.log(setMeshPointsVertexAttributeName.name, { id, name })
    meshPointsVertexAttribute(id).name = name
    return viewerStore.request(
      meshPointsVertexAttributeSchemas.name,
      { id, name },
      {
        response_function: async () => {
          const { minimum, maximum } = meshPointsVertexAttributeStoredConfig(
            id,
            name,
          )
          await setMeshPointsVertexAttributeRange(id, minimum, maximum)
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
    const storedConfig = meshPointsVertexAttributeStoredConfig(id, name)
    const { minimum, maximum } = storedConfig
    return [minimum, maximum]
  }
  function setMeshPointsVertexAttributeRange(id, minimum, maximum) {
    const name = meshPointsVertexAttributeName(id)
    const storedConfig = meshPointsVertexAttributeStoredConfig(id, name)
    storedConfig.minimum = minimum
    storedConfig.maximum = maximum
    return setMeshPointsVertexAttributeColorMap(id, storedConfig.colorMap)
  }

  function meshPointsVertexAttributeColorMap(id) {
    const name = meshPointsVertexAttributeName(id)
    const storedConfig = meshPointsVertexAttributeStoredConfig(id, name)
    const { colorMap } = storedConfig
    return colorMap
  }
  function setMeshPointsVertexAttributeColorMap(id, colorMap) {
    const name = meshPointsVertexAttributeName(id)
    const storedConfig = meshPointsVertexAttributeStoredConfig(id, name)
    if (
      storedConfig.minimum === undefined ||
      storedConfig.maximum === undefined ||
      colorMap === undefined
    ) {
      storedConfig.colorMap = colorMap
      return
    }
    const points = getRGBPointsFromPreset(colorMap)
    const { minimum, maximum } = storedConfig

    console.log(setMeshPointsVertexAttributeColorMap.name, {
      id,
      minimum,
      maximum,
      colorMap,
    })
    return viewerStore.request(
      meshPointsVertexAttributeSchemas.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          storedConfig.colorMap = colorMap
          console.log(
            setMeshPointsVertexAttributeColorMap.name,
            { id },
            meshPointsVertexAttributeColorMap(id),
          )
        },
      },
    )
  }

  return {
    meshPointsVertexAttributeName,
    meshPointsVertexAttributeRange,
    meshPointsVertexAttributeColorMap,
    meshPointsVertexAttributeStoredConfig,
    setMeshPointsVertexAttributeName,
    setMeshPointsVertexAttributeRange,
    setMeshPointsVertexAttributeColorMap,
    updateMeshPointsVertexAttribute,
  }
}
