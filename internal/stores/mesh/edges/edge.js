// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useViewerStore } from "@ogw_front/stores/viewer"
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"
import { useMeshEdgesCommonStyle } from "./common"

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
    })
  }

  function setMeshEdgesEdgeAttributeStoredConfig(
    id,
    name,
    { minimum, maximum, colorMap },
  ) {
    const storedConfigs = meshEdgesEdgeAttribute(id).storedConfigs
    storedConfigs[name] = { minimum, maximum, colorMap }
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
    return viewerStore.request(
      meshEdgesEdgeAttributeSchemas.name,
      { id, name },
      {
        response_function: async () => {
          meshEdgesEdgeAttribute(id).name = name
          const { minimum, maximum, colorMap } =
            meshEdgesEdgeAttributeStoredConfig(id, name)
          await setMeshEdgesEdgeAttributeRange(id, minimum, maximum)
          await setMeshEdgesEdgeAttributeColorMap(id, colorMap)
          console.log(
            setMeshEdgesEdgeAttributeName.name,
            { id },
            meshEdgesEdgeAttributeName(id),
          )
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
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name)
    return viewerStore.request(
      meshEdgesEdgeAttributeSchemas.scalar_range,
      { id, minimum, maximum },
      {
        response_function: () => {
          storedConfig.minimum = minimum
          storedConfig.maximum = maximum
          console.log(
            setMeshEdgesEdgeAttributeRange.name,
            { id },
            meshEdgesEdgeAttributeRange(id),
          )
        },
      },
    )
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
    const edges = getRGBPointsFromPreset(colorMap)
    const { minimum, maximum } = storedConfig

    console.log(setMeshEdgesEdgeAttributeColorMap.name, {
      id,
      minimum,
      maximum,
      colorMap,
    })
    return viewerStore.request(
      meshEdgesEdgeAttributeSchemas.color_map,
      { id, edges, minimum, maximum },
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
    setMeshEdgesEdgeAttributeName,
    setMeshEdgesEdgeAttributeRange,
    setMeshEdgesEdgeAttributeColorMap,
  }
}
