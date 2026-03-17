// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"
import { useMeshEdgesCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const meshEdgesVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.edges.attribute.vertex

export function useMeshEdgesVertexAttributeStyle() {
  const viewerStore = useViewerStore()
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle()

  function meshEdgesVertexAttribute(id) {
    return meshEdgesCommonStyle.meshEdgesColoring(id).vertex
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

  function setMeshEdgesVertexAttributeStoredConfig(
    id,
    name,
    { minimum, maximum, colorMap },
  ) {
    return meshEdgesCommonStyle
      .mutateMeshEdgesVertexStyle(id, (vertex) => {
        vertex.storedConfigs[name] = {
          minimum,
          maximum,
          colorMap,
        }
      })
      .then(() => {
        return meshEdgesVertexAttributeStoredConfig(id, name)
      })
  }

  function meshEdgesVertexAttributeName(id) {
    console.log(
      meshEdgesVertexAttributeName.name,
      { id },
      meshEdgesVertexAttribute(id),
    )
    return meshEdgesVertexAttribute(id).name
  }
  function setMeshEdgesVertexAttributeName(id, name) {
    const mutate = () => {
      return meshEdgesCommonStyle
        .mutateMeshEdgesVertexStyle(id, (vertex) => {
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
          const { minimum, maximum } = meshEdgesVertexAttributeStoredConfig(
            id,
            name,
          )
          return setMeshEdgesVertexAttributeRange(id, minimum, maximum).then(
            () => {
              console.log(
                setMeshEdgesVertexAttributeName.name,
                { id },
                meshEdgesVertexAttributeName(id),
              )
            },
          )
        })
    }

    if (meshEdgesVertexAttributeSchemas?.name && name !== "") {
      return viewerStore.request(
        meshEdgesVertexAttributeSchemas.name,
        { id, name },
        {
          response_function: mutate,
        },
      )
    } else {
      return mutate()
    }
  }

  function meshEdgesVertexAttributeRange(id) {
    const name = meshEdgesVertexAttributeName(id)
    const storedConfig = meshEdgesVertexAttributeStoredConfig(id, name)
    const { minimum, maximum } = storedConfig
    return [minimum, maximum]
  }
  function setMeshEdgesVertexAttributeRange(id, minimum, maximum) {
    const name = meshEdgesVertexAttributeName(id)
    return meshEdgesCommonStyle
      .mutateMeshEdgesVertexStyle(id, (vertex) => {
        const storedConfig = vertex.storedConfigs[name]
        storedConfig.minimum = minimum
        storedConfig.maximum = maximum
      })
      .then(() => {
        return setMeshEdgesVertexAttributeColorMap(
          id,
          meshEdgesVertexAttributeColorMap(id),
        )
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
    const mutate = () => {
      return meshEdgesCommonStyle
        .mutateMeshEdgesVertexStyle(id, (vertex) => {
          vertex.storedConfigs[name].colorMap = colorMap
        })
        .then(() => {
          console.log(
            setMeshEdgesVertexAttributeColorMap.name,
            { id },
            meshEdgesVertexAttributeColorMap(id),
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

    if (meshEdgesVertexAttributeSchemas?.color_map) {
      const points = getRGBPointsFromPreset(colorMap)
      const { minimum, maximum } = storedConfig

      console.log(setMeshEdgesVertexAttributeColorMap.name, {
        id,
        minimum,
        maximum,
        colorMap,
      })
      return viewerStore.request(
        meshEdgesVertexAttributeSchemas.color_map,
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
    meshEdgesVertexAttributeName,
    meshEdgesVertexAttributeRange,
    meshEdgesVertexAttributeColorMap,
    meshEdgesVertexAttributeStoredConfig,
    setMeshEdgesVertexAttributeName,
    setMeshEdgesVertexAttributeRange,
    setMeshEdgesVertexAttributeColorMap,
  }
}
