// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"
import { useMeshPointsCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const meshPointsVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.points.attribute.vertex

export function useMeshPointsVertexAttributeStyle() {
  const viewerStore = useViewerStore()
  const meshPointsCommonStyle = useMeshPointsCommonStyle()

  function meshPointsVertexAttribute(id) {
    return meshPointsCommonStyle.meshPointsColoring(id).vertex
  }

  function meshPointsVertexAttributeStoredConfig(id, name) {
    const { storedConfigs } = meshPointsVertexAttribute(id)
    if (name in storedConfigs) {
      return storedConfigs[name]
    }
    return setMeshPointsVertexAttributeStoredConfig(id, name, {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    })
  }

  function setMeshPointsVertexAttributeStoredConfig(
    id,
    name,
    { minimum, maximum, colorMap },
  ) {
    const config = { minimum, maximum, colorMap }
    return meshPointsCommonStyle
      .mutateMeshPointsVertexStyle(id, (vertex) => {
        vertex.storedConfigs[name] = config
      })
      .then(() => config)
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
    const mutate = () => {
      return meshPointsCommonStyle.mutateMeshPointsVertexStyle(id, (vertex) => {
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
        console.log(setMeshPointsVertexAttributeName.name, { id }, name)
      })
    }

    if (meshPointsVertexAttributeSchemas?.name && name !== "") {
      return viewerStore.request(
        meshPointsVertexAttributeSchemas.name,
        { id, name },
        {
          response_function: mutate,
        },
      )
    } else {
      return mutate()
    }
  }

  function meshPointsVertexAttributeRange(id) {
    const name = meshPointsVertexAttributeName(id)
    const storedConfig = meshPointsVertexAttributeStoredConfig(id, name)
    const { minimum, maximum } = storedConfig
    return [minimum, maximum]
  }
  function setMeshPointsVertexAttributeRange(id, minimum, maximum) {
    const name = meshPointsVertexAttributeName(id)
    return meshPointsCommonStyle.mutateMeshPointsVertexStyle(id, (vertex) => {
      const storedConfig = vertex.storedConfigs[name]
      storedConfig.minimum = minimum
      storedConfig.maximum = maximum
      // Update color map synchronously
      const colorMap = vertex.storedConfigs[name].colorMap
      vertex.storedConfigs[name].colorMap = colorMap
    })
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
    const mutate = () => {
      return meshPointsCommonStyle.mutateMeshPointsVertexStyle(id, (vertex) => {
        vertex.storedConfigs[name].colorMap = colorMap
        console.log(
          setMeshPointsVertexAttributeColorMap.name,
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

    if (meshPointsVertexAttributeSchemas?.color_map) {
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
          response_function: mutate,
        },
      )
    } else {
      return mutate()
    }
  }

  return {
    meshPointsVertexAttributeName,
    meshPointsVertexAttributeRange,
    meshPointsVertexAttributeColorMap,
    meshPointsVertexAttributeStoredConfig,
    setMeshPointsVertexAttributeName,
    setMeshPointsVertexAttributeRange,
    setMeshPointsVertexAttributeColorMap,
  }
}
