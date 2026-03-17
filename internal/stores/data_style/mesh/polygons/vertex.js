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
    const config = { minimum, maximum, colorMap }
    return meshPolygonsCommonStyle.mutateMeshPolygonsVertexStyle(
      id,
      (vertex) => {
        vertex.storedConfigs[name] = config
      },
    ).then(() => config)
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
    const mutate = () => {
      return meshPolygonsCommonStyle
        .mutateMeshPolygonsVertexStyle(id, (vertex) => {
          vertex.name = name
          if (!(name in vertex.storedConfigs)) {
            vertex.storedConfigs[name] = {
              minimum: undefined,
              maximum: undefined,
              colorMap: undefined,
            }
          }
          const { minimum, maximum, colorMap } = vertex.storedConfigs[name]
          const storedConfig = vertex.storedConfigs[name]
          storedConfig.minimum = minimum
          storedConfig.maximum = maximum
          vertex.storedConfigs[name].colorMap = colorMap
          console.log(setMeshPolygonsVertexAttributeName.name, { id }, name)
        })
    }

    if (meshPolygonsVertexAttributeSchemas?.name && name !== "") {
      return viewerStore.request(
        meshPolygonsVertexAttributeSchemas.name,
        { id, name },
        {
          response_function: mutate,
        },
      )
    } else {
      return mutate()
    }
  }

  function meshPolygonsVertexAttributeRange(id) {
    const name = meshPolygonsVertexAttributeName(id)
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(id, name)
    const { minimum, maximum } = storedConfig
    return [minimum, maximum]
  }
  function setMeshPolygonsVertexAttributeRange(id, minimum, maximum) {
    const name = meshPolygonsVertexAttributeName(id)
    return meshPolygonsCommonStyle
      .mutateMeshPolygonsVertexStyle(id, (vertex) => {
        const storedConfig = vertex.storedConfigs[name]
        storedConfig.minimum = minimum
        storedConfig.maximum = maximum
        // Update color map synchronously
        const colorMap = vertex.storedConfigs[name].colorMap
        vertex.storedConfigs[name].colorMap = colorMap
      })
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
    const mutate = () => {
      return meshPolygonsCommonStyle
        .mutateMeshPolygonsVertexStyle(id, (vertex) => {
          vertex.storedConfigs[name].colorMap = colorMap
          vertex.storedConfigs[name].colorMap = colorMap
          console.log(
            setMeshPolygonsVertexAttributeColorMap.name,
            { id },
            vertex.storedConfigs[name].colorMap,
          )
        })
    }

    if (
      storedConfig.minimum === undefined ||
      storedConfig.maximum === undefined ||
      colorMap === undefined
    ) {
      return mutate()
    }

    if (meshPolygonsVertexAttributeSchemas?.color_map) {
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
          response_function: mutate,
        },
      )
    } else {
      return mutate()
    }
  }

  return {
    meshPolygonsVertexAttributeName,
    meshPolygonsVertexAttributeRange,
    meshPolygonsVertexAttributeColorMap,
    meshPolygonsVertexAttributeStoredConfig,
    setMeshPolygonsVertexAttributeName,
    setMeshPolygonsVertexAttributeRange,
    setMeshPolygonsVertexAttributeColorMap,
  }
}
