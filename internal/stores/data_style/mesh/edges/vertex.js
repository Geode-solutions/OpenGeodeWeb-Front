// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useViewerStore } from "@ogw_front/stores/viewer"
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"
import { useMeshEdgesCommonStyle } from "./common"

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
    const storedConfig = meshEdgesVertexAttributeStoredConfig(id, name)
    await meshEdgesVertexAttributeRange(
      id,
      storedConfig.minimum,
      storedConfig.maximum,
    )
    await meshEdgesVertexAttributeColorMap(id, storedConfig.colorMap)
  }

  function meshEdgesVertexAttributeStoredConfig(id, name) {
    const storedConfigs = meshEdgesVertexAttribute(id).storedConfigs
    if (name in storedConfigs) {
      return storedConfigs[name]
    }
    return setMeshEdgesVertexAttributeStoredConfig(id, name, {
      minimum: 0,
      maximum: 1,
      colorMap: "Cool to Warm",
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
    console.log(setMeshEdgesVertexAttributeName.name, { id, name })
    return viewerStore.request(
      meshEdgesVertexAttributeSchemas.name,
      { id, name },
      {
        response_function: async () => {
          meshEdgesVertexAttribute(id).name = name
          const { minimum, maximum, colorMap } =
            meshEdgesVertexAttributeStoredConfig(id, name)
          await setMeshEdgesVertexAttributeRange(id, minimum, maximum)
          await setMeshEdgesVertexAttributeColorMap(id, colorMap)
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
    return viewerStore.request(
      meshEdgesVertexAttributeSchemas.scalar_range,
      { id, minimum, maximum },
      {
        response_function: () => {
          storedConfig.minimum = minimum
          storedConfig.maximum = maximum
          console.log(
            setMeshEdgesVertexAttributeRange.name,
            { id },
            meshEdgesVertexAttributeRange(id),
          )
        },
      },
    )
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
    setMeshEdgesVertexAttributeName,
    setMeshEdgesVertexAttributeRange,
    setMeshEdgesVertexAttributeColorMap,
    updateMeshEdgesVertexAttribute,
  }
}
