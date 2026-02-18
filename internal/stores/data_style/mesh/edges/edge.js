// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
// import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"
import { useMeshEdgesCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const meshEdgesEdgeAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.edges.attribute.edge

export function useMeshEdgesEdgeAttributeStyle() {
  const viewerStore = useViewerStore()
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle()

  function meshEdgesEdgeAttribute(id) {
    return meshEdgesCommonStyle.meshEdgesColoring(id).edge
  }

  function meshEdgesEdgeAttributeStoredConfig(id, name) {
    const storedConfigs = meshEdgesEdgeAttribute(id).storedConfigs
    if (name in storedConfigs) {
      return storedConfigs[name]
    }
    return setMeshEdgesEdgeAttributeStoredConfig(id, name, {
      minimum: 0,
      maximum: 1,
      colorMap: "Cool to Warm",
      isAutoSet: false,
    })
  }

  function setMeshEdgesEdgeAttributeStoredConfig(
    id,
    name,
    { minimum, maximum, colorMap, isAutoSet },
  ) {
    const storedConfigs = meshEdgesEdgeAttribute(id).storedConfigs
    storedConfigs[name] = { minimum, maximum, colorMap, isAutoSet }
    return storedConfigs[name]
  }

  function meshEdgesEdgeAttributeName(id) {
    console.log(
      meshEdgesEdgeAttributeName.name,
      { id },
      meshEdgesEdgeAttribute(id),
    )
    return meshEdgesEdgeAttribute(id).name
  }
  function setMeshEdgesEdgeAttributeName(id, name) {
    console.log(setMeshEdgesEdgeAttributeName.name, { id, name })
    meshEdgesEdgeAttribute(id).name = name
    return viewerStore.request(
      meshEdgesEdgeAttributeSchemas.name,
      { id, name },
      {
        response_function: async () => {
          const { minimum, maximum } = meshEdgesEdgeAttributeStoredConfig(
            id,
            name,
          )
          await setMeshEdgesEdgeAttributeRange(id, minimum, maximum)
          console.log(
            setMeshEdgesEdgeAttributeName.name,
            { id },
            meshEdgesEdgeAttributeName(id),
          )
        },
      },
    )
  }

  async function updateMeshEdgesEdgeAttribute(id) {
    const name = meshEdgesEdgeAttributeName(id)
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name)
    await setMeshEdgesEdgeAttributeRange(
      id,
      storedConfig.minimum,
      storedConfig.maximum,
    )
    await setMeshEdgesEdgeAttributeColorMap(id, storedConfig.colorMap)
  }

  function meshEdgesEdgeAttributeRange(id) {
    const name = meshEdgesEdgeAttributeName(id)
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name)
    const { minimum, maximum } = storedConfig
    return [minimum, maximum]
  }
  function setMeshEdgesEdgeAttributeRange(id, minimum, maximum) {
    const name = meshEdgesEdgeAttributeName(id)
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name)
    storedConfig.minimum = minimum
    storedConfig.maximum = maximum
    storedConfig.isAutoSet = true
    return setMeshEdgesEdgeAttributeColorMap(id, storedConfig.colorMap)
  }

  function meshEdgesEdgeAttributeColorMap(id) {
    const name = meshEdgesEdgeAttributeName(id)
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name)
    const { colorMap } = storedConfig
    return colorMap
  }
  function setMeshEdgesEdgeAttributeColorMap(id, colorMap) {
    const name = meshEdgesEdgeAttributeName(id)
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name)
    const points = getRGBPointsFromPreset(colorMap)
    const { minimum, maximum } = storedConfig

    console.log(setMeshEdgesEdgeAttributeColorMap.name, {
      id,
      minimum,
      maximum,
      colorMap,
    })
    return viewerStore.request(
      meshEdgesEdgeAttributeSchemas.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          storedConfig.colorMap = colorMap
          console.log(
            setMeshEdgesEdgeAttributeColorMap.name,
            { id },
            meshEdgesEdgeAttributeColorMap(id),
          )
        },
      },
    )
  }

  return {
    meshEdgesEdgeAttributeName,
    meshEdgesEdgeAttributeRange,
    meshEdgesEdgeAttributeColorMap,
    meshEdgesEdgeAttributeStoredConfig,
    setMeshEdgesEdgeAttributeName,
    setMeshEdgesEdgeAttributeRange,
    setMeshEdgesEdgeAttributeColorMap,
    updateMeshEdgesEdgeAttribute,
  }
}
