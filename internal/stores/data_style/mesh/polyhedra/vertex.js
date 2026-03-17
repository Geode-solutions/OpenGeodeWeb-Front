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

  function setMeshPolyhedraVertexAttributeStoredConfig(
    id,
    name,
    { minimum, maximum, colorMap },
  ) {
    return meshPolyhedraCommonStyle
      .mutateMeshPolyhedraVertexStyle(id, (vertex) => {
        vertex.storedConfigs[name] = {
          minimum,
          maximum,
          colorMap,
        }
      })
      .then(() => {
        return meshPolyhedraVertexAttributeStoredConfig(id, name)
      })
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
    const mutate = () => {
      return meshPolyhedraCommonStyle
        .mutateMeshPolyhedraVertexStyle(id, (vertex) => {
          vertex.name = name
          if (!(name in vertex.storedConfigs)) {
            vertex.storedConfigs[name] = {
              minimum: undefined,
              maximum: undefined,
              colorMap: undefined,
            }
          }
        })
        .then(() => {
          const { minimum, maximum } = meshPolyhedraVertexAttributeStoredConfig(
            id,
            name,
          )
          return setMeshPolyhedraVertexAttributeRange(
            id,
            minimum,
            maximum,
          ).then(() => {
            console.log(
              setMeshPolyhedraVertexAttributeName.name,
              { id },
              meshPolyhedraVertexAttributeName(id),
            )
          })
        })
    }

    if (meshPolyhedraVertexAttributeSchemas?.name && name !== "") {
      return viewerStore.request(
        meshPolyhedraVertexAttributeSchemas.name,
        { id, name },
        {
          response_function: mutate,
        },
      )
    } else {
      return mutate()
    }
  }

  function meshPolyhedraVertexAttributeRange(id) {
    const name = meshPolyhedraVertexAttributeName(id)
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name)
    const { minimum, maximum } = storedConfig
    return [minimum, maximum]
  }
  function setMeshPolyhedraVertexAttributeRange(id, minimum, maximum) {
    const name = meshPolyhedraVertexAttributeName(id)
    return meshPolyhedraCommonStyle
      .mutateMeshPolyhedraVertexStyle(id, (vertex) => {
        const storedConfig = vertex.storedConfigs[name]
        storedConfig.minimum = minimum
        storedConfig.maximum = maximum
      })
      .then(() => {
        return setMeshPolyhedraVertexAttributeColorMap(
          id,
          meshPolyhedraVertexAttributeColorMap(id),
        )
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
    const mutate = () => {
      return meshPolyhedraCommonStyle
        .mutateMeshPolyhedraVertexStyle(id, (vertex) => {
          vertex.storedConfigs[name].colorMap = colorMap
        })
        .then(() => {
          console.log(
            setMeshPolyhedraVertexAttributeColorMap.name,
            { id },
            meshPolyhedraVertexAttributeColorMap(id),
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

    if (meshPolyhedraVertexAttributeSchemas?.color_map) {
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
          response_function: mutate,
        },
      )
    } else {
      return mutate()
    }
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
