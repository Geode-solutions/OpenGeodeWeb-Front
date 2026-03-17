// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"
import { useMeshPolygonsCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const meshPolygonsPolygonAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polygons.attribute.polygon

export function useMeshPolygonsPolygonAttributeStyle() {
  const viewerStore = useViewerStore()
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle()

  function meshPolygonsPolygonAttribute(id) {
    return meshPolygonsCommonStyle.meshPolygonsColoring(id).polygon
  }

  function meshPolygonsPolygonAttributeStoredConfig(id, name) {
    const { storedConfigs } = meshPolygonsPolygonAttribute(id)
    if (name in storedConfigs) {
      return storedConfigs[name]
    }
    return setMeshPolygonsPolygonAttributeStoredConfig(id, name, {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    })
  }

  function setMeshPolygonsPolygonAttributeStoredConfig(
    id,
    name,
    { minimum, maximum, colorMap },
  ) {
    const config = { minimum, maximum, colorMap }
    return meshPolygonsCommonStyle.mutateMeshPolygonsPolygonStyle(
      id,
      (polygon) => {
        polygon.storedConfigs[name] = config
      },
    ).then(() => config)
  }

  function meshPolygonsPolygonAttributeName(id) {
    return meshPolygonsPolygonAttribute(id).name
  }
  function setMeshPolygonsPolygonAttributeName(id, name) {
    const mutate = () => {
      return meshPolygonsCommonStyle.mutateMeshPolygonsPolygonStyle(
        id,
        (polygon) => {
          polygon.name = name
          if (!(name in polygon.storedConfigs)) {
            polygon.storedConfigs[name] = {
              minimum: undefined,
              maximum: undefined,
              colorMap: undefined,
            }
          }
          const { minimum, maximum, colorMap } = polygon.storedConfigs[name]
          const storedConfig = polygon.storedConfigs[name]
          storedConfig.minimum = minimum
          storedConfig.maximum = maximum
          polygon.storedConfigs[name].colorMap = colorMap
          console.log(setMeshPolygonsPolygonAttributeName.name, { id }, name)
        },
      )
    }

    if (meshPolygonsPolygonAttributeSchemas?.name && name !== "") {
      return viewerStore.request(
        meshPolygonsPolygonAttributeSchemas.name,
        { id, name },
        {
          response_function: mutate,
        },
      )
    } else {
      return mutate()
    }
  }
  function meshPolygonsPolygonAttributeRange(id) {
    const name = meshPolygonsPolygonAttributeName(id)
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(id, name)
    const { minimum, maximum } = storedConfig
    console.log(
      meshPolygonsPolygonAttributeRange.name,
      { id },
      { minimum, maximum },
    )
    return [minimum, maximum]
  }
  function setMeshPolygonsPolygonAttributeRange(id, minimum, maximum) {
    const name = meshPolygonsPolygonAttributeName(id)
    return meshPolygonsCommonStyle.mutateMeshPolygonsPolygonStyle(
      id,
      (polygon) => {
        const storedConfig = polygon.storedConfigs[name]
        storedConfig.minimum = minimum
        storedConfig.maximum = maximum
        // Update color map synchronously
        const colorMap = polygon.storedConfigs[name].colorMap
        polygon.storedConfigs[name].colorMap = colorMap
      },
    )
  }

  function meshPolygonsPolygonAttributeColorMap(id) {
    const name = meshPolygonsPolygonAttributeName(id)
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(id, name)
    const { colorMap } = storedConfig
    return colorMap
  }
  function setMeshPolygonsPolygonAttributeColorMap(id, colorMap) {
    const name = meshPolygonsPolygonAttributeName(id)
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(id, name)
    const mutate = () => {
      return meshPolygonsCommonStyle.mutateMeshPolygonsPolygonStyle(
        id,
        (polygon) => {
          polygon.storedConfigs[name].colorMap = colorMap
          console.log(
            setMeshPolygonsPolygonAttributeColorMap.name,
            { id },
            polygon.storedConfigs[name].colorMap,
          )
        },
      )
    }

    if (
      storedConfig.minimum === undefined ||
      storedConfig.maximum === undefined ||
      colorMap === undefined
    ) {
      return mutate()
    }

    if (meshPolygonsPolygonAttributeSchemas?.color_map) {
      const points = getRGBPointsFromPreset(colorMap)
      const { minimum, maximum } = storedConfig
      return viewerStore.request(
        meshPolygonsPolygonAttributeSchemas.color_map,
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
    meshPolygonsPolygonAttributeName,
    meshPolygonsPolygonAttributeRange,
    meshPolygonsPolygonAttributeColorMap,
    meshPolygonsPolygonAttributeStoredConfig,
    setMeshPolygonsPolygonAttributeName,
    setMeshPolygonsPolygonAttributeRange,
    setMeshPolygonsPolygonAttributeColorMap,
  }
}
