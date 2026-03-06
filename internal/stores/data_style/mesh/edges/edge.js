// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"
import { useMeshEdgesCommonStyle } from "./common"
import { useDataStyleStateStore } from "../../state"
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

  async function setMeshEdgesEdgeAttributeStoredConfig(
    id,
    name,
    { minimum, maximum, colorMap },
  ) {
    const dataStyleStateStore = useDataStyleStateStore()
    await dataStyleStateStore.mutateStyle(id, (style) => {
      style.edges.coloring.edge.storedConfigs[name] = {
        minimum,
        maximum,
        colorMap,
      }
    })
    return meshEdgesEdgeAttributeStoredConfig(id, name)
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
    const dataStyleStateStore = useDataStyleStateStore()
    const updateState = async () => {
      await dataStyleStateStore.mutateStyle(id, (style) => {
        const edge = style.edges.coloring.edge
        edge.name = name
        if (!(name in edge.storedConfigs)) {
          edge.storedConfigs[name] = {
            minimum: undefined,
            maximum: undefined,
            colorMap: undefined,
          }
        }
      })
      const { minimum, maximum } = meshEdgesEdgeAttributeStoredConfig(id, name)
      await setMeshEdgesEdgeAttributeRange(id, minimum, maximum)
      console.log(
        setMeshEdgesEdgeAttributeName.name,
        { id },
        meshEdgesEdgeAttributeName(id),
      )
    }

    if (meshEdgesEdgeAttributeSchemas?.name && name !== "") {
      return viewerStore.request(
        meshEdgesEdgeAttributeSchemas.name,
        { id, name },
        {
          response_function: updateState,
        },
      )
    } else {
      return updateState()
    }
  }

  function meshEdgesEdgeAttributeRange(id) {
    const name = meshEdgesEdgeAttributeName(id)
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name)
    const { minimum, maximum } = storedConfig
    return [minimum, maximum]
  }
  async function setMeshEdgesEdgeAttributeRange(id, minimum, maximum) {
    const name = meshEdgesEdgeAttributeName(id)
    const dataStyleStateStore = useDataStyleStateStore()
    await dataStyleStateStore.mutateStyle(id, (style) => {
      const storedConfig = style.edges.coloring.edge.storedConfigs[name]
      storedConfig.minimum = minimum
      storedConfig.maximum = maximum
    })
    return setMeshEdgesEdgeAttributeColorMap(
      id,
      meshEdgesEdgeAttributeColorMap(id),
    )
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
    const dataStyleStateStore = useDataStyleStateStore()
    const updateState = async () => {
      await dataStyleStateStore.mutateStyle(id, (style) => {
        style.edges.coloring.edge.storedConfigs[name].colorMap = colorMap
      })
      console.log(
        setMeshEdgesEdgeAttributeColorMap.name,
        { id },
        meshEdgesEdgeAttributeColorMap(id),
      )
    }

    if (
      storedConfig.minimum === undefined ||
      storedConfig.maximum === undefined ||
      colorMap === undefined
    ) {
      return updateState()
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
          response_function: updateState,
        },
      )
    } else {
      return updateState()
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
