// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"
import { useMeshPointsCommonStyle } from "./common"
import { useDataStyleStateStore } from "../../state"
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

  async function setMeshPointsVertexAttributeStoredConfig(
    id,
    name,
    { minimum, maximum, colorMap },
  ) {
    const dataStyleStateStore = useDataStyleStateStore()
    await dataStyleStateStore.mutateStyle(id, (style) => {
      style.points.coloring.vertex.storedConfigs[name] = {
        minimum,
        maximum,
        colorMap,
      }
    })
    return meshPointsVertexAttributeStoredConfig(id, name)
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
    const dataStyleStateStore = useDataStyleStateStore()
    const updateState = async () => {
      await dataStyleStateStore.mutateStyle(id, (style) => {
        const vertex = style.points.coloring.vertex
        vertex.name = name
        if (!(name in vertex.storedConfigs)) {
          vertex.storedConfigs[name] = {
            minimum: undefined,
            maximum: undefined,
            colorMap: undefined,
          }
        }
      })
      const { minimum, maximum } = meshPointsVertexAttributeStoredConfig(
        id,
        name,
      )
      await setMeshPointsVertexAttributeRange(id, minimum, maximum)
      console.log(
        setMeshPointsVertexAttributeName.name,
        { id },
        meshPointsVertexAttributeName(id),
      )
    }

    if (meshPointsVertexAttributeSchemas?.name && name !== "") {
      return viewerStore.request(
        meshPointsVertexAttributeSchemas.name,
        { id, name },
        {
          response_function: updateState,
        },
      )
    } else {
      return updateState()
    }
  }

  function meshPointsVertexAttributeRange(id) {
    const name = meshPointsVertexAttributeName(id)
    const storedConfig = meshPointsVertexAttributeStoredConfig(id, name)
    const { minimum, maximum } = storedConfig
    return [minimum, maximum]
  }
  async function setMeshPointsVertexAttributeRange(id, minimum, maximum) {
    const name = meshPointsVertexAttributeName(id)
    const dataStyleStateStore = useDataStyleStateStore()
    await dataStyleStateStore.mutateStyle(id, (style) => {
      const storedConfig = style.points.coloring.vertex.storedConfigs[name]
      storedConfig.minimum = minimum
      storedConfig.maximum = maximum
    })
    return setMeshPointsVertexAttributeColorMap(
      id,
      meshPointsVertexAttributeColorMap(id),
    )
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
    const dataStyleStateStore = useDataStyleStateStore()
    const updateState = async () => {
      await dataStyleStateStore.mutateStyle(id, (style) => {
        style.points.coloring.vertex.storedConfigs[name].colorMap = colorMap
      })
      console.log(
        setMeshPointsVertexAttributeColorMap.name,
        { id },
        meshPointsVertexAttributeColorMap(id),
      )
    }

    if (
      storedConfig.minimum === undefined ||
      storedConfig.maximum === undefined ||
      colorMap === undefined
    ) {
      return updateState()
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
          response_function: updateState,
        },
      )
    } else {
      return updateState()
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
