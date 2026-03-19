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

  function meshPolyhedraVertexAttributeStoredConfig(id, name) {
    const { storedConfigs } = meshPolyhedraVertexAttribute(id)
    if (name in storedConfigs) {
      return storedConfigs[name]
    }
    return setMeshPolyhedraVertexAttributeStoredConfig(id, name, {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    })
  }

  function mutateMeshPolyhedraVertexStyle(id, values) {
    return meshPolyhedraCommonStyle.mutateMeshPolyhedraStyle(id, {
      coloring: {
        vertex: values,
      },
    })
  }

  function setMeshPolyhedraVertexAttributeStoredConfig(id, name, config) {
    return mutateMeshPolyhedraVertexStyle(id, {
      storedConfigs: {
        [name]: config,
      },
    })
  }

  function meshPolyhedraVertexAttributeName(id) {
    return meshPolyhedraVertexAttribute(id).name
  }

  function setMeshPolyhedraVertexAttributeName(id, name) {
    return viewerStore.request(
      meshPolyhedraVertexAttributeSchemas.name,
      { id, name },
      {
        response_function: () => {
          const updates = { name }
          const vertex = meshPolyhedraVertexAttribute(id)
          if (!(name in vertex.storedConfigs)) {
            updates.storedConfigs = {
              [name]: {
                minimum: undefined,
                maximum: undefined,
                colorMap: undefined,
              },
            }
          }
          return mutateMeshPolyhedraVertexStyle(id, updates)
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
    return setMeshPolyhedraVertexAttributeStoredConfig(id, name, {
      minimum,
      maximum,
    })
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
    return viewerStore.request(
      meshPolyhedraVertexAttributeSchemas.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          return setMeshPolyhedraVertexAttributeStoredConfig(id, name, {
            colorMap,
          })
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
  }
}
