// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useMeshEdgesCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const meshEdgesVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.edges.attribute.vertex

export function useMeshEdgesVertexAttributeStyle() {
  const viewerStore = useViewerStore()
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle()

  function meshEdgesColoring(id) {
    return meshEdgesCommonStyle.meshEdgesStyle(id).coloring
  }

  function meshEdgesVertexAttribute(id) {
    return meshEdgesColoring(id).vertex
  }

  function meshEdgesVertexAttributeStoredConfig(id, name) {
    const { storedConfigs } = meshEdgesVertexAttribute(id)
    if (name in storedConfigs) {
      return storedConfigs[name]
    }
    return setMeshEdgesVertexAttributeStoredConfig(id, name, {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    })
  }

  function mutateMeshEdgesVertexStyle(id, values) {
    return meshEdgesCommonStyle.mutateMeshEdgesStyle(id, {
      coloring: {
        ...meshEdgesColoring(id),
        vertex: {
          ...meshEdgesVertexAttribute(id),
          ...values,
        },
      },
    })
  }

  function setMeshEdgesVertexAttributeStoredConfig(id, name, config) {
    const vertex = meshEdgesVertexAttribute(id)
    return mutateMeshEdgesVertexStyle(id, {
      storedConfigs: {
        ...vertex.storedConfigs,
        [name]: {
          ...vertex.storedConfigs[name],
          ...config,
        },
      },
    }).then(() => config)
  }

  function meshEdgesVertexAttributeName(id) {
    return meshEdgesVertexAttribute(id).name
  }
  function setMeshEdgesVertexAttributeName(id, name) {
    return viewerStore.request(
      meshEdgesVertexAttributeSchemas.name,
      { id, name },
      {
        response_function: () => {
          const vertex = meshEdgesVertexAttribute(id)
          const updates = { name }
          if (!(name in vertex.storedConfigs)) {
            updates.storedConfigs = {
              ...vertex.storedConfigs,
              [name]: {
                minimum: undefined,
                maximum: undefined,
                colorMap: undefined,
              },
            }
          }
          return mutateMeshEdgesVertexStyle(id, updates)
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
    return setMeshEdgesVertexAttributeStoredConfig(id, name, {
      minimum,
      maximum,
    })
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
    return viewerStore.request(
      meshEdgesVertexAttributeSchemas.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          return setMeshEdgesVertexAttributeStoredConfig(id, name, { colorMap })
        },
      },
    )
  }

  return {
    meshEdgesVertexAttributeName,
    meshEdgesVertexAttributeRange,
    meshEdgesVertexAttributeColorMap,
    meshEdgesVertexAttributeStoredConfig,
    setMeshEdgesVertexAttributeName,
    setMeshEdgesVertexAttributeRange,
    setMeshEdgesVertexAttributeColorMap,
  }
}
