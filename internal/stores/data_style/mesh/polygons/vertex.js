// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"
import { useMeshPolygonsCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"
import { useDataStyleStateStore } from "../../state"

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

  async function setMeshPolygonsVertexAttributeStoredConfig(
    id,
    name,
    { minimum, maximum, colorMap },
  ) {
    const dataStyleStateStore = useDataStyleStateStore()
    await dataStyleStateStore.mutateStyle(id, (style) => {
      style.polygons.coloring.vertex.storedConfigs[name] = {
        minimum,
        maximum,
        colorMap,
      }
    })
    return meshPolygonsVertexAttributeStoredConfig(id, name)
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
    const dataStyleStateStore = useDataStyleStateStore()
    const updateState = async () => {
      await dataStyleStateStore.mutateStyle(id, (style) => {
        const vertex = style.polygons.coloring.vertex
        vertex.name = name
        if (!(name in vertex.storedConfigs)) {
          vertex.storedConfigs[name] = {
            minimum: undefined,
            maximum: undefined,
            colorMap: undefined,
          }
        }
      })
      const { minimum, maximum } = meshPolygonsVertexAttributeStoredConfig(
        id,
        name,
      )
      await setMeshPolygonsVertexAttributeRange(id, minimum, maximum)
      console.log(
        setMeshPolygonsVertexAttributeName.name,
        { id },
        meshPolygonsVertexAttributeName(id),
      )
    }

    if (meshPolygonsVertexAttributeSchemas?.name && name !== "") {
      return viewerStore.request(
        meshPolygonsVertexAttributeSchemas.name,
        { id, name },
        {
          response_function: updateState,
        },
      )
    } else {
      return updateState()
    }
  }

  function meshPolygonsVertexAttributeRange(id) {
    const name = meshPolygonsVertexAttributeName(id)
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(id, name)
    const { minimum, maximum } = storedConfig
    return [minimum, maximum]
  }
  async function setMeshPolygonsVertexAttributeRange(id, minimum, maximum) {
    const name = meshPolygonsVertexAttributeName(id)
    const dataStyleStateStore = useDataStyleStateStore()
    await dataStyleStateStore.mutateStyle(id, (style) => {
      const storedConfig = style.polygons.coloring.vertex.storedConfigs[name]
      storedConfig.minimum = minimum
      storedConfig.maximum = maximum
    })
    return setMeshPolygonsVertexAttributeColorMap(
      id,
      meshPolygonsVertexAttributeColorMap(id),
    )
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
    const dataStyleStateStore = useDataStyleStateStore()
    const updateState = async () => {
      await dataStyleStateStore.mutateStyle(id, (style) => {
        style.polygons.coloring.vertex.storedConfigs[name].colorMap = colorMap
      })
      console.log(
        setMeshPolygonsVertexAttributeColorMap.name,
        { id },
        meshPolygonsVertexAttributeColorMap(id),
      )
    }

    if (
      storedConfig.minimum === undefined ||
      storedConfig.maximum === undefined ||
      colorMap === undefined
    ) {
      return updateState()
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
          response_function: updateState,
        },
      )
    } else {
      return updateState()
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
