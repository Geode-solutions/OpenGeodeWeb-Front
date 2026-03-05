// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"
import { useMeshEdgesCommonStyle } from "./common"
import { useDataStyleStateStore } from "../../state"
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

  async function setMeshEdgesVertexAttributeStoredConfig(
    id,
    name,
    { minimum, maximum, colorMap },
  ) {
    const dataStyleStateStore = useDataStyleStateStore()
    await dataStyleStateStore.mutateStyle(id, (style) => {
      style.edges.coloring.vertex.storedConfigs[name] = {
        minimum,
        maximum,
        colorMap,
      }
    })
    return meshEdgesVertexAttributeStoredConfig(id, name)
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
    const dataStyleStateStore = useDataStyleStateStore()
    const updateState = async () => {
      await dataStyleStateStore.mutateStyle(id, (style) => {
        const vertex = style.edges.coloring.vertex
        vertex.name = name
        if (!(name in vertex.storedConfigs)) {
          vertex.storedConfigs[name] = {
            minimum: undefined,
            maximum: undefined,
            colorMap: undefined,
          }
        }
      })
      const { minimum, maximum } = meshEdgesVertexAttributeStoredConfig(
        id,
        name,
      )
      await setMeshEdgesVertexAttributeRange(id, minimum, maximum)
      console.log(
        setMeshEdgesVertexAttributeName.name,
        { id },
        meshEdgesVertexAttributeName(id),
      )
    }

    if (meshEdgesVertexAttributeSchemas?.name && name !== "") {
      return viewerStore.request(
        meshEdgesVertexAttributeSchemas.name,
        { id, name },
        {
          response_function: updateState,
        },
      )
    } else {
      return updateState()
    }
  }

  function meshEdgesVertexAttributeRange(id) {
    const name = meshEdgesVertexAttributeName(id)
    const storedConfig = meshEdgesVertexAttributeStoredConfig(id, name)
    const { minimum, maximum } = storedConfig
    return [minimum, maximum]
  }
  async function setMeshEdgesVertexAttributeRange(id, minimum, maximum) {
    const name = meshEdgesVertexAttributeName(id)
    const dataStyleStateStore = useDataStyleStateStore()
    await dataStyleStateStore.mutateStyle(id, (style) => {
      const storedConfig = style.edges.coloring.vertex.storedConfigs[name]
      storedConfig.minimum = minimum
      storedConfig.maximum = maximum
    })
    return setMeshEdgesVertexAttributeColorMap(
      id,
      meshEdgesVertexAttributeColorMap(id),
    )
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
    const dataStyleStateStore = useDataStyleStateStore()
    const updateState = async () => {
      await dataStyleStateStore.mutateStyle(id, (style) => {
        style.edges.coloring.vertex.storedConfigs[name].colorMap = colorMap
      })
      console.log(
        setMeshEdgesVertexAttributeColorMap.name,
        { id },
        meshEdgesVertexAttributeColorMap(id),
      )
    }

    if (
      storedConfig.minimum === undefined ||
      storedConfig.maximum === undefined ||
      colorMap === undefined
    ) {
      return updateState()
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
          response_function: updateState,
        },
      )
    } else {
      return updateState()
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
