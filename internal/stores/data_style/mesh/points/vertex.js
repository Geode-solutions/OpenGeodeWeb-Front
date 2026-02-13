// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useViewerStore } from "@ogw_front/stores/viewer"
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"
import { useMeshPointsCommonStyle } from "./common"

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
    await meshPointsVertexAttributeRange(
      id,
      storedConfig.minimum,
      storedConfig.maximum,
    )
    await meshPointsVertexAttributeColorMap(id, storedConfig.colorMap)
  }

  function meshPointsVertexAttributeStoredConfig(id, name) {
    const storedConfigs = meshPointsVertexAttribute(id).storedConfigs
    if (name in storedConfigs) {
      return storedConfigs[name]
    }
    return setMeshPointsVertexAttributeStoredConfig(id, name, {
      minimum: 0,
      maximum: 1,
      colorMap: "Cool to Warm",
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
    return viewerStore.request(
      meshPointsVertexAttributeSchemas.name,
      { id, name },
      {
        response_function: async () => {
          meshPointsVertexAttribute(id).name = name
          const { minimum, maximum, colorMap } =
            meshPointsVertexAttributeStoredConfig(id, name)
          await setMeshPointsVertexAttributeRange(id, minimum, maximum)
          await setMeshPointsVertexAttributeColorMap(id, colorMap)
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
    return viewerStore.request(
      meshPointsVertexAttributeSchemas.scalar_range,
      { id, minimum, maximum },
      {
        response_function: () => {
          storedConfig.minimum = minimum
          storedConfig.maximum = maximum
          console.log(
            setMeshPointsVertexAttributeRange.name,
            { id },
            meshPointsVertexAttributeRange(id),
          )
        },
      },
    )
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
    setMeshPointsVertexAttributeName,
    setMeshPointsVertexAttributeRange,
    setMeshPointsVertexAttributeColorMap,
    updateMeshPointsVertexAttribute,
  }
}
