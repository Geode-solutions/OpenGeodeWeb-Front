// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"
import { useMeshPolygonsCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const meshPolygonsVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polygons.attribute.vertex

export function useMeshPolygonsVertexAttributeStyle() {
  const viewerStore = useViewerStore()
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle()

  function meshPolygonsVertexAttribute(id) {
    return meshPolygonsCommonStyle.meshPolygonsColoring(id).vertex
  }

  async function updateMeshPolygonsVertexAttribute(id) {
    const name = meshPolygonsVertexAttributeName(id)
    if (!name) {
      return
    }
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(id, name)
    await setMeshPolygonsVertexAttributeRange(
      id,
      storedConfig.minimum,
      storedConfig.maximum,
    )
    await setMeshPolygonsVertexAttributeColorMap(id, storedConfig.colorMap)
  }

  function meshPolygonsVertexAttributeStoredConfig(id, name) {
    const { storedConfigs } = meshPolygonsVertexAttribute(id)
    if (name in storedConfigs) {
      return storedConfigs[name]
    }
    return setMeshPolygonsVertexAttributeStoredConfig(id, name, {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    })
  }

  function setMeshPolygonsVertexAttributeStoredConfig(
    id,
    name,
    { minimum, maximum, colorMap },
  ) {
    const storedConfigs = meshPolygonsVertexAttribute(id).storedConfigs
    storedConfigs[name] = { minimum, maximum, colorMap }
    return storedConfigs[name]
  }

  function meshPolygonsVertexAttributeName(id) {
    console.log(
      meshPolygonsVertexAttributeName.name,
      { id },
      meshPolygonsVertexAttribute(id),
    )
    return meshPolygonsVertexAttribute(id).name
  }
  function setMeshPolygonsVertexAttributeName(id, name) {
    if (name === meshPolygonsVertexAttributeName(id)) {
      return
    }
    console.log(setMeshPolygonsVertexAttributeName.name, { id, name })
    return viewerStore.request(
      meshPolygonsVertexAttributeSchemas.name,
      { id, name },
      {
        response_function: async () => {
          meshPolygonsVertexAttribute(id).name = name
          if (!name) {
            return
          }
          const { minimum, maximum } = meshPolygonsVertexAttributeStoredConfig(
            id,
            name,
          )
          await setMeshPolygonsVertexAttributeRange(id, minimum, maximum)
          console.log(
            setMeshPolygonsVertexAttributeName.name,
            { id },
            meshPolygonsVertexAttributeName(id),
          )
        },
      },
    )
  }

  function meshPolygonsVertexAttributeRange(id) {
    const name = meshPolygonsVertexAttributeName(id)
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(id, name)
    const { minimum, maximum } = storedConfig
    return [minimum, maximum]
  }
  function setMeshPolygonsVertexAttributeRange(id, minimum, maximum) {
    const name = meshPolygonsVertexAttributeName(id)
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(id, name)
    storedConfig.minimum = minimum
    storedConfig.maximum = maximum
    return setMeshPolygonsVertexAttributeColorMap(id, storedConfig.colorMap)
  }

  function meshPolygonsVertexAttributeColorMap(id) {
    const name = meshPolygonsVertexAttributeName(id)
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(id, name)
    const { colorMap } = storedConfig
    return colorMap
  }
  function setMeshPolygonsVertexAttributeColorMap(id, colorMap) {
    const name = meshPolygonsVertexAttributeName(id)
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(id, name)
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

    console.log(setMeshPolygonsVertexAttributeColorMap.name, {
      id,
      minimum,
      maximum,
      colorMap,
    })
    return viewerStore.request(
      meshPolygonsVertexAttributeSchemas.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          storedConfig.colorMap = colorMap
          console.log(
            setMeshPolygonsVertexAttributeColorMap.name,
            { id },
            meshPolygonsVertexAttributeColorMap(id),
          )
        },
      },
    )
  }

  return {
    meshPolygonsVertexAttributeName,
    meshPolygonsVertexAttributeRange,
    meshPolygonsVertexAttributeColorMap,
    meshPolygonsVertexAttributeStoredConfig,
    setMeshPolygonsVertexAttributeName,
    setMeshPolygonsVertexAttributeRange,
    setMeshPolygonsVertexAttributeColorMap,
    updateMeshPolygonsVertexAttribute,
  }
}
