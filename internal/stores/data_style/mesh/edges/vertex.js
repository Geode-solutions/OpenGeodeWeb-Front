// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"
import { useMeshEdgesCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const meshEdgesVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.edges.attribute.vertex

export function useMeshEdgesVertexAttributeStyle() {
  const viewerStore = useViewerStore()
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle()

  function meshEdgesVertexAttribute(id) {
    return meshEdgesCommonStyle.meshEdgesColoring(id).vertex
  }

  async function updateMeshEdgesVertexAttribute(id) {
    const name = meshEdgesVertexAttributeName(id)
    if (!name) {
      return
    }
    const storedConfig = meshEdgesVertexAttributeStoredConfig(id, name)
    await setMeshEdgesVertexAttributeRange(
      id,
      storedConfig.minimum,
      storedConfig.maximum,
    )
    await setMeshEdgesVertexAttributeColorMap(id, storedConfig.colorMap)
  }

  function meshEdgesVertexAttributeStoredConfig(id, name) {
    const { storedConfigs } = meshEdgesVertexAttribute(id)
    if (name in storedConfigs) {
      return storedConfigs[name]
    }
    return setMeshEdgesVertexAttributeStoredConfig(id, name, {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    })
  }

  function setMeshEdgesVertexAttributeStoredConfig(
    id,
    name,
    { minimum, maximum, colorMap },
  ) {
    const storedConfigs = meshEdgesVertexAttribute(id).storedConfigs
    storedConfigs[name] = { minimum, maximum, colorMap }
    return storedConfigs[name]
  }

  function meshEdgesVertexAttributeName(id) {
    console.log(
      meshEdgesVertexAttributeName.name,
      { id },
      meshEdgesVertexAttribute(id),
    )
    return meshEdgesVertexAttribute(id).name
  }
  function setMeshEdgesVertexAttributeName(id, name) {
    if (name === meshEdgesVertexAttributeName(id)) {
      return
    }
    console.log(setMeshEdgesVertexAttributeName.name, { id, name })
    return viewerStore.request(
      meshEdgesVertexAttributeSchemas.name,
      { id, name },
      {
        response_function: async () => {
          meshEdgesVertexAttribute(id).name = name
          if (!name) {
            return
          }
          const { minimum, maximum } = meshEdgesVertexAttributeStoredConfig(
            id,
            name,
          )
          await setMeshEdgesVertexAttributeRange(id, minimum, maximum)
          console.log(
            setMeshEdgesVertexAttributeName.name,
            { id },
            meshEdgesVertexAttributeName(id),
          )
        },
      },
    )
  }

  function meshEdgesVertexAttributeRange(id) {
    const name = meshEdgesVertexAttributeName(id)
    const storedConfig = meshEdgesVertexAttributeStoredConfig(id, name)
    const { minimum, maximum } = storedConfig
    return [minimum, maximum]
  }
  function setMeshEdgesVertexAttributeRange(id, minimum, maximum) {
    const name = meshEdgesVertexAttributeName(id)
    const storedConfig = meshEdgesVertexAttributeStoredConfig(id, name)
    storedConfig.minimum = minimum
    storedConfig.maximum = maximum
    return setMeshEdgesVertexAttributeColorMap(id, storedConfig.colorMap)
  }

  function meshEdgesVertexAttributeColorMap(id) {
    const name = meshEdgesVertexAttributeName(id)
    const storedConfig = meshEdgesVertexAttributeStoredConfig(id, name)
    const { colorMap } = storedConfig
    return colorMap
  }
  function setMeshEdgesVertexAttributeColorMap(id, colorMap) {
    const name = meshEdgesVertexAttributeName(id)
    const storedConfig = meshEdgesVertexAttributeStoredConfig(id, name)
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

    console.log(setMeshEdgesVertexAttributeColorMap.name, {
      id,
      minimum,
      maximum,
      colorMap,
    })
    return viewerStore.request(
      meshEdgesVertexAttributeSchemas.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          storedConfig.colorMap = colorMap
          console.log(
            setMeshEdgesVertexAttributeColorMap.name,
            { id },
            meshEdgesVertexAttributeColorMap(id),
          )
        },
      },
    )
  }

  return {
    meshEdgesVertexAttributeName,
    meshEdgesVertexAttributeRange,
    meshEdgesVertexAttributeColorMap,
    meshEdgesVertexAttributeStoredConfig,
    setMeshEdgesVertexAttributeName,
    setMeshEdgesVertexAttributeRange,
    setMeshEdgesVertexAttributeColorMap,
    updateMeshEdgesVertexAttribute,
  }
}
