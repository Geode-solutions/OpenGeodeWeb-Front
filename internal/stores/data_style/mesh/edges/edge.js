// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"
import { useMeshEdgesCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const meshEdgesEdgeAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.edges.attribute.edge

export function useMeshEdgesEdgeAttributeStyle() {
  const viewerStore = useViewerStore()
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle()

  function meshEdgesEdgeAttribute(id) {
    return meshEdgesCommonStyle.meshEdgesColoring(id).edge
  }

  function meshEdgesEdgeAttributeStoredConfig(id, name) {
    const storedConfigs = meshEdgesEdgeAttribute(id).storedConfigs
    if (name in storedConfigs) {
      return storedConfigs[name]
    }
    return setMeshEdgesEdgeAttributeStoredConfig(id, name, {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    })
  }

  function setMeshEdgesEdgeAttributeStoredConfig(
    id,
    name,
    { minimum, maximum, colorMap },
  ) {
    return meshEdgesCommonStyle
      .mutateMeshEdgesEdgeStyle(id, (edge) => {
        edge.storedConfigs[name] = {
          minimum,
          maximum,
          colorMap,
        }
      })
      .then(() => {
        return meshEdgesEdgeAttributeStoredConfig(id, name)
      })
  }

  function meshEdgesEdgeAttributeName(id) {
    console.log(
      meshEdgesEdgeAttributeName.name,
      { id },
      meshEdgesEdgeAttribute(id),
    )
    return meshEdgesEdgeAttribute(id).name
  }
  function setMeshEdgesEdgeAttributeName(id, name) {
    const mutate = () => {
      return meshEdgesCommonStyle
        .mutateMeshEdgesEdgeStyle(id, (edge) => {
          edge.name = name
          if (!(name in edge.storedConfigs)) {
            edge.storedConfigs[name] = {
              minimum: undefined,
              maximum: undefined,
              colorMap: undefined,
            }
          }
        })
        .then(() => {
          const { minimum, maximum } = meshEdgesEdgeAttributeStoredConfig(
            id,
            name,
          )
          return setMeshEdgesEdgeAttributeRange(id, minimum, maximum).then(
            () => {
              console.log(
                setMeshEdgesEdgeAttributeName.name,
                { id },
                meshEdgesEdgeAttributeName(id),
              )
            },
          )
        })
    }

    if (meshEdgesEdgeAttributeSchemas?.name && name !== "") {
      return viewerStore.request(
        meshEdgesEdgeAttributeSchemas.name,
        { id, name },
        {
          response_function: mutate,
        },
      )
    } else {
      return mutate()
    }
  }

  function meshEdgesEdgeAttributeRange(id) {
    const name = meshEdgesEdgeAttributeName(id)
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name)
    const { minimum, maximum } = storedConfig
    return [minimum, maximum]
  }
  function setMeshEdgesEdgeAttributeRange(id, minimum, maximum) {
    const name = meshEdgesEdgeAttributeName(id)
    return meshEdgesCommonStyle
      .mutateMeshEdgesEdgeStyle(id, (edge) => {
        const storedConfig = edge.storedConfigs[name]
        storedConfig.minimum = minimum
        storedConfig.maximum = maximum
      })
      .then(() => {
        return setMeshEdgesEdgeAttributeColorMap(
          id,
          meshEdgesEdgeAttributeColorMap(id),
        )
      })
  }

  function meshEdgesEdgeAttributeColorMap(id) {
    const name = meshEdgesEdgeAttributeName(id)
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name)
    const { colorMap } = storedConfig
    return colorMap
  }
  function setMeshEdgesEdgeAttributeColorMap(id, colorMap) {
    const name = meshEdgesEdgeAttributeName(id)
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name)
    const mutate = () => {
      return meshEdgesCommonStyle
        .mutateMeshEdgesEdgeStyle(id, (edge) => {
          edge.storedConfigs[name].colorMap = colorMap
        })
        .then(() => {
          console.log(
            setMeshEdgesEdgeAttributeColorMap.name,
            { id },
            meshEdgesEdgeAttributeColorMap(id),
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

    if (meshEdgesEdgeAttributeSchemas?.color_map) {
      const points = getRGBPointsFromPreset(colorMap)
      const { minimum, maximum } = storedConfig

      console.log(setMeshEdgesEdgeAttributeColorMap.name, {
        id,
        minimum,
        maximum,
        colorMap,
      })
      return viewerStore.request(
        meshEdgesEdgeAttributeSchemas.color_map,
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
    meshEdgesEdgeAttributeName,
    meshEdgesEdgeAttributeRange,
    meshEdgesEdgeAttributeColorMap,
    meshEdgesEdgeAttributeStoredConfig,
    setMeshEdgesEdgeAttributeName,
    setMeshEdgesEdgeAttributeRange,
    setMeshEdgesEdgeAttributeColorMap,
  }
}
