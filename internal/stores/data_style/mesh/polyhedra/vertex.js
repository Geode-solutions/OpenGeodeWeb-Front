// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"
import { useMeshPolyhedraCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"

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
    await setMeshPolyhedraVertexAttributeRange(
      id,
      storedConfig.minimum,
      storedConfig.maximum,
    )
    await setMeshPolyhedraVertexAttributeColorMap(id, storedConfig.colorMap)
  }

  function meshPolyhedraVertexAttributeStoredConfig(id, name) {
    const { storedConfigs } = meshPolyhedraVertexAttribute(id)
    if (name in storedConfigs) {
      return storedConfigs[name]
    }
    return setMeshPolyhedraVertexAttributeStoredConfig(id, name, {
      minimum: 0,
      maximum: 1,
      colorMap: "Cool to Warm",
      isAutoSet: false,
    })
  }

  function setMeshPolyhedraVertexAttributeStoredConfig(
    id,
    name,
    { minimum, maximum, colorMap, isAutoSet },
  ) {
    const storedConfigs = meshPolyhedraVertexAttribute(id).storedConfigs
    storedConfigs[name] = { minimum, maximum, colorMap, isAutoSet }
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
    meshPolyhedraVertexAttribute(id).name = name
    return viewerStore.request(
      meshPolyhedraVertexAttributeSchemas.name,
      { id, name },
      {
        response_function: async () => {
          const { minimum, maximum } =
            meshPolyhedraVertexAttributeStoredConfig(id, name)
          await setMeshPolyhedraVertexAttributeRange(id, minimum, maximum)
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
    storedConfig.minimum = minimum
    storedConfig.maximum = maximum
    storedConfig.isAutoSet = true
    return setMeshPolyhedraVertexAttributeColorMap(id, storedConfig.colorMap)
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
    meshPolyhedraVertexAttributeStoredConfig,
    setMeshPolyhedraVertexAttributeName,
    setMeshPolyhedraVertexAttributeRange,
    setMeshPolyhedraVertexAttributeColorMap,
    updateMeshPolyhedraVertexAttribute,
  }
}
