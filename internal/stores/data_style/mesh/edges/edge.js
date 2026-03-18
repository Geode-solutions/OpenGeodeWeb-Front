// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"
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
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    })
  }

  function setMeshEdgesEdgeAttributeStoredConfig(
    id,
    name,
    { minimum, maximum, colorMap },
  ) {
    const config = { minimum, maximum, colorMap }
    return meshEdgesCommonStyle
      .mutateMeshEdgesEdgeStyle(id, (edge) => {
        edge.storedConfigs[name] = config
      })
      .then(() => config)
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
    return viewerStore.request(
      meshEdgesEdgeAttributeSchemas.name,
      { id, name },
      {
        response_function: () => {
          return meshEdgesCommonStyle.mutateMeshEdgesEdgeStyle(id, (edge) => {
            edge.name = name
            if (!(name in edge.storedConfigs)) {
              edge.storedConfigs[name] = {
                minimum: undefined,
                maximum: undefined,
                colorMap: undefined,
              }
            }
            const { minimum, maximum, colorMap } = edge.storedConfigs[name]
            const storedConfig = edge.storedConfigs[name]
            storedConfig.minimum = minimum
            storedConfig.maximum = maximum
            edge.storedConfigs[name].colorMap = colorMap
            console.log(setMeshEdgesEdgeAttributeName.name, { id }, name)
          })
        },
      },
    )
  }

  function meshEdgesEdgeAttributeRange(id) {
    const name = meshEdgesEdgeAttributeName(id)
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name)
    const { minimum, maximum } = storedConfig
    return [minimum, maximum]
  }
  function setMeshEdgesEdgeAttributeRange(id, minimum, maximum) {
    const name = meshEdgesEdgeAttributeName(id)
    return meshEdgesCommonStyle.mutateMeshEdgesEdgeStyle(id, (edge) => {
      const storedConfig = edge.storedConfigs[name]
      storedConfig.minimum = minimum
      storedConfig.maximum = maximum
      // Update color map synchronously
      const colorMap = edge.storedConfigs[name].colorMap
      edge.storedConfigs[name].colorMap = colorMap
    })
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
          return meshEdgesCommonStyle.mutateMeshEdgesEdgeStyle(id, (edge) => {
            edge.storedConfigs[name].colorMap = colorMap
            console.log(
              setMeshEdgesEdgeAttributeColorMap.name,
              { id },
              edge.storedConfigs[name].colorMap,
            )
          })
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
  }
}
