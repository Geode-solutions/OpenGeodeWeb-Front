// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useViewerStore } from "@ogw_front/stores/viewer"
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"
import { useMeshPolyhedraCommonStyle } from "./common"

// Local constants
const meshPolyhedraVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polyhedra.attribute.vertex

export function useMeshPolyhedraVertexAttributeStyle() {
  const viewerStore = useViewerStore()
  const meshPolyhedraCommonStyle = useMeshPolyhedraCommonStyle()

  function meshPolyhedraVertexAttribute(id) {
    return meshPolyhedraCommonStyle.meshPolyhedraColoring(id).vertex
  }

  async function updateMeshPolyhedraVertexAttribute(id) {
    const name = meshPolyhedraVertexAttributeName(id)
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name)
    await meshPolyhedraVertexAttributeRange(
      id,
      storedConfig.minimum,
      storedConfig.maximum,
    )
    await meshPolyhedraVertexAttributeColorMap(id, storedConfig.colorMap)
  }

  function meshPolyhedraVertexAttributeStoredConfig(id, name) {
    const storedConfigs = meshPolyhedraVertexAttribute(id).storedConfigs
    if (name in storedConfigs) {
      return storedConfigs[name]
    }
    return setMeshPolyhedraVertexAttributeStoredConfig(id, name, {
      minimum: 0,
      maximum: 1,
      colorMap: "Cool to Warm",
    })
  }

  function setMeshPolyhedraVertexAttributeStoredConfig(
    id,
    name,
    { minimum, maximum, colorMap },
  ) {
    const storedConfigs = meshPolyhedraVertexAttribute(id).storedConfigs
    storedConfigs[name] = { minimum, maximum, colorMap }
    return storedConfigs[name]
  }

  function meshPolyhedraVertexAttributeName(id) {
    console.log(
      meshPolyhedraVertexAttributeName.name,
      { id },
      meshPolyhedraVertexAttribute(id),
    )
    return meshPolyhedraVertexAttribute(id).name
  }
  function setMeshPolyhedraVertexAttributeName(id, name) {
    console.log(setMeshPolyhedraVertexAttributeName.name, { id, name })
    return viewerStore.request(
      meshPolyhedraVertexAttributeSchemas.name,
      { id, name },
      {
        response_function: async () => {
          meshPolyhedraVertexAttribute(id).name = name
          const { minimum, maximum, colorMap } =
            meshPolyhedraVertexAttributeStoredConfig(id, name)
          await setMeshPolyhedraVertexAttributeRange(id, minimum, maximum)
          await setMeshPolyhedraVertexAttributeColorMap(id, colorMap)
          console.log(
            setMeshPolyhedraVertexAttributeName.name,
            { id },
            meshPolyhedraVertexAttributeName(id),
          )
        },
      },
    )
  }

  function meshPolyhedraVertexAttributeRange(id) {
    const name = meshPolyhedraVertexAttributeName(id)
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name)
    const { minimum, maximum } = storedConfig
    return [minimum, maximum]
  }
  function setMeshPolyhedraVertexAttributeRange(id, minimum, maximum) {
    const name = meshPolyhedraVertexAttributeName(id)
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name)
    return viewerStore.request(
      meshPolyhedraVertexAttributeSchemas.scalar_range,
      { id, minimum, maximum },
      {
        response_function: () => {
          storedConfig.minimum = minimum
          storedConfig.maximum = maximum
          console.log(
            setMeshPolyhedraVertexAttributeRange.name,
            { id },
            meshPolyhedraVertexAttributeRange(id),
          )
        },
      },
    )
  }

  function meshPolyhedraVertexAttributeColorMap(id) {
    const name = meshPolyhedraVertexAttributeName(id)
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name)
    const { colorMap } = storedConfig
    return colorMap
  }
  function setMeshPolyhedraVertexAttributeColorMap(id, colorMap) {
    const name = meshPolyhedraVertexAttributeName(id)
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name)
    const points = getRGBPointsFromPreset(colorMap)
    const { minimum, maximum } = storedConfig

    console.log(setMeshPolyhedraVertexAttributeColorMap.name, {
      id,
      minimum,
      maximum,
      colorMap,
    })
    return viewerStore.request(
      meshPolyhedraVertexAttributeSchemas.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          storedConfig.colorMap = colorMap
          console.log(
            setMeshPolyhedraVertexAttributeColorMap.name,
            { id },
            meshPolyhedraVertexAttributeColorMap(id),
          )
        },
      },
    )
  }

  return {
    meshPolyhedraVertexAttributeName,
    meshPolyhedraVertexAttributeRange,
    meshPolyhedraVertexAttributeColorMap,
    setMeshPolyhedraVertexAttributeName,
    setMeshPolyhedraVertexAttributeRange,
    setMeshPolyhedraVertexAttributeColorMap,
    updateMeshPolyhedraVertexAttribute,
  }
}
