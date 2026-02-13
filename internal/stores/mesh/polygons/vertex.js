// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useMeshPolygonsCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"

// Local constants
const meshPolygonsVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polygons.attribute.vertex

export function useMeshPolygonsVertexAttributeStyle() {
  const viewerStore = useViewerStore()
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle()

  function meshPolygonsVertexAttribute(id) {
    console.log(
      meshPolygonsVertexAttribute.name,
      { id },
      meshPolygonsCommonStyle.meshPolygonsColoring(id),
    )
    return meshPolygonsCommonStyle.meshPolygonsColoring(id).vertex
  }

  function meshPolygonsVertexAttributeStoredConfig(id, name) {
    const storedConfigs = meshPolygonsVertexAttribute(id).storedConfigs
    if (name in storedConfigs) {
      return storedConfigs[name]
    }
    return setMeshPolygonsVertexAttributeStoredConfig(id, name, {
      minimum: 0,
      maximum: 1,
      colorMap: "Cool to Warm",
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
    console.log(setMeshPolygonsVertexAttributeName.name, { id, name })
    return viewerStore.request(
      meshPolygonsVertexAttributeSchemas.name,
      { id, name },
      {
        response_function: async () => {
          meshPolygonsVertexAttribute(id).name = name
          const { minimum, maximum, colorMap } =
            meshPolygonsVertexAttributeStoredConfig(id, name)
          await setMeshPolygonsVertexAttributeRange(id, minimum, maximum)
          await setMeshPolygonsVertexAttributeColorMap(id, colorMap)
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
    return viewerStore.request(
      meshPolygonsVertexAttributeSchemas.scalar_range,
      { id, minimum, maximum },
      {
        response_function: () => {
          storedConfig.minimum = minimum
          storedConfig.maximum = maximum
          console.log(
            setMeshPolygonsVertexAttributeRange.name,
            { id },
            meshPolygonsVertexAttributeRange(id),
          )
        },
      },
    )
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
    setMeshPolygonsVertexAttributeName,
    setMeshPolygonsVertexAttributeRange,
    setMeshPolygonsVertexAttributeColorMap,
  }
}
